import * as _ from "lodash";
import {assertCreatureExists, Creatures} from "../data/creatures";
import {v4} from "node-uuid";
import {getTrait} from "../data/Traits";
import {debugMessage} from "../debugging";
import { Decimal } from "decimal.js";
import {Character} from "../character";
import {config} from "../config";
import {generateHitCombatResult, generateMissCombatResult, generateSkipActionResult} from "../combatResult";
import CharacterCombatState from "./CharacterCombatState";
import * as Package from "../../package.json";

export const saveKey = require("md5")(`hell-conquest-${Package.version}`);

const expressionCache = {};

export function resolveCombat(rng, definition) {
    const listeners = [];
    const combatResult = {
        rounds: [],
        winner: null,
        combatantCombatStats: {}
    }

    async function notifyListener(listener) {
        listener(combatResult, _.takeRight(combatResult.rounds)[0]);
    }

    const combatants = _.flatMap(definition.parties.map((party, partyIndex) => {
        return party.map((character, characterIndex) => {
            combatResult.combatantCombatStats[character.id] = new CharacterCombatState({
                hp: character.currentHp,
                speed: character.speed,
                party: partyIndex
            });
            return {
                character,
                party: partyIndex
            }
        })
    }));
    debugMessage("Beginning combat")
    // Trigger start of combat effects.
    combatants.forEach(combatant => Object.keys(combatant.character.traits).forEach(trait => {
        combatants.filter(other => other !== combatant).forEach(otherCombatant => {
            applyTrait(combatant.character, otherCombatant.id, getTrait(trait), combatant.character.traits[trait], "on_combat_start", {combat: combatResult}, 0, rng);
        });
    }))
    let tick = 0;
    const resolveRound = async function () {
        const initiatives = _.uniq(combatants.map(combatant => Math.floor(Decimal(10000).div(combatResult.combatantCombatStats[combatant.character.id].speed).toNumber())))
            .sort((a, b) => a - b);
        initiatives.forEach(initiativeCount => {
            // TODO: Activate/deactivate traits
            const actingCharacters = combatants
                .filter(wrapped => {
                    const isAlive = wrapped.character.alive;
                    const characterSpeed = Math.floor(Decimal(10000).div(combatResult.combatantCombatStats[wrapped.character.id].speed).toNumber());
                    const matchingSpeed = (initiativeCount % characterSpeed === 0);
                    return isAlive && matchingSpeed;
                });
            actingCharacters.forEach(acting => {
                const character = acting.character;
                tick = combatResult.combatantCombatStats[character.id].lastActed + Math.floor(Decimal(10000).div(combatResult.combatantCombatStats[character.id].speed).toNumber());
                combatResult.combatantCombatStats[character.id].lastActed = tick;
                debugMessage(`Tick ${tick}: Resolving action by character '${character.id}'.`);
                if (combatResult.combatantCombatStats[character.id].hp.lte(0)) {
                    debugMessage(`Tick ${tick}: Character ${character.id} was dead when their turn to act came up, skipping their action.`);
                    return;
                }
                // The acting character performs an accuracy.
                const enemyParty = (acting.party + 1) % 2;
                const livingEnemies = definition.parties[enemyParty]
                    .filter(enemy => combatResult.combatantCombatStats[enemy.id].hp.gt(0));
                const target = _.get(livingEnemies[Math.floor(rng.double() * livingEnemies.length)], "id");
                if (target === undefined) {
                    debugMessage(`Tick ${tick}: No valid target, skipping action by ${character.id}.`);
                    return;
                }
                if (combatResult.combatantCombatStats[character.id].canAct) {
                    debugMessage(`Tick ${tick}: Attacking ${target}`);
                    const attackRollResult = makeAttackRoll(character, target, combatResult, rng);

                    // Trigger on-accuracy effects
                    if (attackRollResult.total >= 50) {
                        debugMessage(`Tick ${tick}: ${character.id} rolled ${attackRollResult.total}, a hit.`);
                        resolveHit(tick, combatResult, character, target, rng);
                    } else {
                        debugMessage(`Tick ${tick}: ${character.id} rolled ${attackRollResult.total}, a miss.`);
                        resolveMiss(tick, combatResult, character, target, rng);
                        // TODO: Trigger on-miss effects
                    }
                } else {
                    debugMessage(`${tick}: Character skips their action.`);
                    resolveSkippedAction(tick, combatResult, character);
                }
                listeners.forEach(notifyListener);
                Object.keys(combatResult.combatantCombatStats).forEach(combatantId => {
                    if (combatResult.combatantCombatStats[combatantId].hp.lte(0)) {
                        debugMessage(`Tick ${tick}: Combatant ${combatantId} died`);
                        combatResult.rounds.push({
                            uuid: v4(),
                            tick,
                            actor: character.id,
                            target: Number.parseInt(combatantId),
                            result: "kill"
                        });
                        listeners.forEach(notifyListener);
                    }
                });
                combatResult.combatantCombatStats[acting.character.id].fatigue++;
                // TODO: Add logs for when effects expire.
                combatResult.combatantCombatStats[acting.character.id].modifiers = combatResult.combatantCombatStats[acting.character.id].modifiers
                    .map(modifier => {
                        modifier.roundDuration = Decimal(modifier.roundDuration).minus(1);
                        return modifier;
                    })
                    .filter(modifier => Decimal(modifier.roundDuration).gt(0))

            });
        });
        const playerPartyDead = definition.parties[0].every(character => combatResult.combatantCombatStats[character.id].hp.lte(0));
        const enemyPartyDead = definition.parties[1].every(character => combatResult.combatantCombatStats[character.id].hp.lte(0));
        if (playerPartyDead || enemyPartyDead) {
            if (playerPartyDead) {
                debugMessage("Every member of party 0 is dead")
                combatResult.rounds.push({
                    uuid: v4(),
                    tick,
                    winner: 1,
                    result: "combat-end"
                })
                combatResult.winner = 1;
                listeners.forEach(notifyListener);
                // Clear all end of combat
            } else if (enemyPartyDead) {
                debugMessage("Every member of party 1 is dead")
                combatResult.rounds.push({
                    uuid: v4(),
                    tick,
                    winner: 0,
                    result: "combat-end",
                });
                combatResult.winner = 0;
                listeners.forEach(notifyListener);
            }

        } else {
            debugMessage("No winner, combat continues");
            setTimeout(resolveRound);
        }
    };
    setTimeout(resolveRound)
    return {
        onRoundResolved: async function (listener, getPrevious) {
            listeners.push(listener);
            notifyListener(listener);
        }
    }

}

function makeAttackRoll(actingCharacter, target, combatState, rng) {
    const attackAccuracy = Decimal(actingCharacter.attributes[config.mechanics.accuracy.baseAttribute]).times(config.mechanics.accuracy.attributeBonusScale);
    const targetEvasion = Decimal(getCharacter(target).attributes[config.mechanics.evasion.baseAttribute]).times(config.mechanics.evasion.attributeBonusScale)
        .minus(Decimal(config.mechanics.fatigue.evasionPenaltyPerPoint).times(combatState.combatantCombatStats[target].fatigue));
    // TODO: Validation
    debugMessage("Making an accuracy roll. Attacker Accuracy:", attackAccuracy.toFixed(), "Target Evasion:", targetEvasion.toFixed());
    const roll = Math.floor((rng.double() * 100));
    return {
        rawRoll: roll,
        attackAccuracy,
        targetEvasion,
        total: attackAccuracy.minus(targetEvasion).plus(roll)
    };
}

let globalState = loadGlobalState()

export function getGlobalState() {
    return globalState;
}

export function saveGlobalState() {
    window.localStorage.setItem(saveKey, JSON.stringify(globalState));
}

export function loadGlobalState(state) {
    const loaded = window.localStorage.getItem(saveKey);
    return loaded ? JSON.parse(loaded, stateReviver) : {
        debug: {
            creatures: {},
            regions: {}
        },
        passivePowerIncome: Decimal(0),
        unlockedMonsters: {},
        paused: true,
        currentAction: null,
        nextAction: null,
        id: 0,
        highestLevelReached: Decimal(0),
        startingTraits: {},
        currentEncounter: null,
        manualSpeedMultiplier: config.manualSpeedup.multiplier,
        currentRegion: "forest",
        actionLog: [],
        exploration: {
            explorationTime: 15 * 1000,
            approachTime: 15 * 1000,
            combatTime: 5 * 1000,
            lootingTime: 15 * 1000,
            recoveryTime: 2 * 1000,
            fleeingTime: 15 * 1000,
            intimidateTime: 15 * 1000,
            reincarnationTime: 1
        },
        characters: {
            0: new Character({
                id: 0,
                isPc: true,
                name: "You",
                powerLevel: Decimal(1),
                absorbedPower: Decimal(0),
                appearance: "",
                statuses: {},
                traits: {},
                items: [],
                attributes: {
                    brutality: Decimal(0),
                    cunning: Decimal(0),
                    deceit: Decimal(0),
                    madness: Decimal(0)
                },
                combat: {
                    fatigue: 0,
                    minimumDamageMultiplier: .5,
                    medianDamageMultiplier: 1,
                    maximumDamageMultiplier: 1.5
                }
            })
        },
        tutorials: {}
    }
}

export function getCharacter(id) {
    assertCharacterExists(id);
    return globalState.characters[id];
}

let nextMonsterId = 1;

export function generateCreature(id, powerLevel, rng) {
    assertCreatureExists(id);
    if (config.debug) {
        debugMessage(`Generating creature with id ${id} and level ${powerLevel}`);
    }
    if (powerLevel === undefined) {
        throw new Error("No powerLevel");
    }
    if (Number.isNaN(powerLevel)) {
        throw new Error("Level cannot be NaN");
    }
    const nextId = nextMonsterId++;
    globalState.characters[nextId] = new Character({
        id: nextId,
        ...Creatures[id],
        latentPower: powerLevel.minus(1).pow(2).times(5),
        traits: Creatures[id].traits.reduce((traits, next) => {
            traits[next] = powerLevel;
            return traits;
        }, {}),
        absorbedPower: getPowerNeededForLevel(powerLevel),
        artifacts: [],
        statuses: [],
        attributes: {
            brutality: powerLevel.div(2).floor(),
            cunning: powerLevel.div(2).floor(),
            deceit: powerLevel.div(2).floor(),
            madness: powerLevel.div(2).floor(),
        },
        combat: {
            fatigue: 0,
            minimumDamageMultiplier: .5,
            medianDamageMultiplier: 1,
            maximumDamageMultiplier: 1.5
        }
    });
    saveGlobalState();
    return globalState.characters[nextId];
}


export function getSpriteForCreature(name) {
    assertCreatureExists(name);
    return `monsters/${Creatures[name].texture}`;
}

function assertCharacterExists(id) {
    if (!globalState.characters[id]) {
        throw new Error(`No creature exists for '${id}'`);
    }
}

function resolveHit(tick, combatResult, actingCharacter, targetCharacter, rng) {
    if (typeof actingCharacter !== "object") {
        throw new Error(`Acting character was not an object!`);
    }
    if (typeof targetCharacter !== "number") {
        throw new Error(`Target character was not an object!`);
    }
    const damageRoll = Math.floor(rng.double() * 100);
    let damageToInflict;
    if (damageRoll <= 20) {
        damageToInflict = actingCharacter.combat.minimumDamage;
        debugMessage(`Tick ${tick}: Damage roll ${damageRoll}, a glancing hit for ${damageToInflict}.`);
    } else if (damageRoll <= 80) {
        damageToInflict = actingCharacter.combat.medianDamage;
        debugMessage(`Tick ${tick}: Damage roll ${damageRoll}, a solid hit for ${damageToInflict}.`);
    } else {
        damageToInflict = actingCharacter.combat.maximumDamage;
        debugMessage(`Tick ${tick}: Damage roll ${damageRoll}, a critical hit for ${damageToInflict}.`);
    }
    const attackResult = {
        baseDamage: damageToInflict,
        attackerDamageMultiplier: Decimal(actingCharacter.attributes[config.mechanics.attackDamage.baseAttribute])
            .times(config.mechanics.attackDamage.attributeBonusScale),
        targetDefenseMultiplier: Decimal(getCharacter(targetCharacter).attributes[config.mechanics.defense.baseAttribute])
            .times(config.mechanics.defense.attributeBonusScale),
        otherEffects: []
    }
    // Trigger on-hit effects
    Object.keys(actingCharacter.traits).forEach(trait => applyTrait(actingCharacter, targetCharacter, getTrait(trait), actingCharacter.traits[trait], "on_hitting", {
        combat: combatResult,
        attack: attackResult
    }, tick, rng));
    const damageFactor = attackResult.attackerDamageMultiplier.plus(100) // FIXME: Evaluable expression
        .div(Decimal.max(attackResult.targetDefenseMultiplier.plus(100), 1));
    const finalDamage = attackResult.baseDamage.times(damageFactor).floor()

    debugMessage(`Damage started off as ${attackResult.baseDamage.toFixed()}, with an attack factor of ${attackResult.attackerDamageMultiplier} and a target defense factor of ${attackResult.targetDefenseMultiplier}, for a total factor of ${damageFactor} and a final damage of ${finalDamage.toFixed()}`);
    combatResult.combatantCombatStats[targetCharacter].hp = combatResult.combatantCombatStats[targetCharacter].hp.minus(damageToInflict);
    debugMessage(`Tick ${tick}: Hit did ${finalDamage.toFixed()}. Additional effects: ${attackResult.otherEffects.map(effect => {
        switch (effect.event) {
            case "apply_effect":
                return `Applying effect ${effect.effect} with from ${effect.source} to ${effect.target}.`
        }

    }).join(", ")}. Target has ${combatResult.combatantCombatStats[targetCharacter].hp} remaining.`)
    // TODO: Trigger on-damage effects
    combatResult.rounds.push(generateHitCombatResult(tick, actingCharacter.id, targetCharacter, finalDamage, attackResult.otherEffects));
}

function resolveMiss(tick, combatResult, actingCharacter, targetCharacterId, rng) {
    combatResult.rounds.push(generateMissCombatResult(tick, actingCharacter.id, targetCharacterId));
}

function resolveSkippedAction(tick, combatResult, actingCharacter) {
    combatResult.rounds.push(generateSkipActionResult(tick, actingCharacter.id));
}

function applyTrait(sourceCharacter, targetCharacter, trait, rank, event, state, tick, rng) {
    const rankModifier = sourceCharacter.attributes[config.mechanics.traitRank.baseAttribute].times(config.mechanics.traitRank.attributeBonusScale).div(100);
    rank = Decimal.min(Decimal(rank).plus(Decimal(rank).times(rankModifier)).floor(), 100);
    debugMessage(`Character has a bonus to rank of ${sourceCharacter.attributes.madness.toFixed()}% from madness, for an effective rank of ${rank}`);
    debugMessage(`Tick ${tick}: Determining if trait ${trait.name} applies`);
    if (trait[event]) {
        const effect = trait[event];
        if (effect.conditions !== undefined) {
            debugMessage("Trait has conditions");
        }
        const effectTriggers = effect.conditions === undefined || Object.keys(effect.conditions)
            .every(condition => {
                switch (condition) {
                    case "health_percentage":
                        // Fixme: Implement validation
                        const target = getCharacter(effect.conditions[condition].target === "attacker" ? sourceCharacter : targetCharacter);
                        const targetPercent = Decimal(effect.conditions[condition].below);
                        const targetCurrentHealth = state.combat.combatantCombatStats[target.id].hp;
                        const targetMaxHealth = target.maximumHp;
                        const currentHealthPercent = (targetCurrentHealth.mul(100).div(targetMaxHealth));
                        const conditionMet = targetPercent.gte(currentHealthPercent);
                        debugMessage(`Tick ${tick}: Target health percentage is ${currentHealthPercent}, which is ${conditionMet ? "" : "not"} enough to trigger.`);
                        return conditionMet;
                    case "chance":
                        const chanceToTrigger = evaluateExpression(trait[event].conditions[condition], {
                            $rank: rank
                        });
                        const roll = Math.floor(rng.double() * 100) + 1;
                        if (chanceToTrigger >= roll) {
                            debugMessage(`Chance to trigger ${chanceToTrigger} with roll ${roll}: success`);
                            return true;
                        } else {
                            debugMessage(`Chance to trigger ${chanceToTrigger} with roll ${roll}: failure.`);
                            return false;
                        }
                    default:
                        return false;
                }
            })
        if (effectTriggers) {
            debugMessage(`Tick ${tick}: Effect triggered, applying effects`);
            Object.keys(trait[event].effects).forEach(traitEffect => {
                    // FIXME
                    switch (traitEffect) {
                        case "damage_modifier":
                            // FIXME: Validation
                            const percentDamageModifier = evaluateExpression(trait[event].effects[traitEffect].percent, {
                                $rank: rank
                            });
                            if(percentDamageModifier) {
                                const newMultiplier = state.attack.attackerDamageMultiplier.plus(percentDamageModifier);
                                debugMessage(`Tick ${tick}: Applying ${percentDamageModifier.toFixed()} modifier to damage, changing damage multiplier from ${state.attack.attackerDamageMultiplier.div(100).toFixed()} to ${newMultiplier.div(100).toFixed()}`);
                                state.attack.attackerDamageMultiplier = newMultiplier;
                            }
                            break;
                        case "defense_modifier": {
                            const defenseModifier = evaluateExpression(trait[event].effects[traitEffect].percent, {
                                $rank: rank
                            }).div(100).plus(1);
                            const newMultiplier = state.attack.targetDefenseMultiplier.times(defenseModifier);
                            debugMessage(`Tick ${tick}: Applying ${defenseModifier} modifier to defense, changing defense multiplier from ${state.attack.targetDefenseMultiplier.toFixed()} to ${newMultiplier.toFixed()}`);
                            state.attack.targetDefenseMultiplier = newMultiplier;
                            break;
                        }
                        // case "speed_modifier" :
                        //     const percentageSpeedMultiplier = evaluateExpression(trait[event].effects[traitEffect].percent, {
                        //         $rank: rank
                        //     });
                        //
                        //     const effect = {
                        //         effect: {
                        //             speed_bonus_percent: percentageSpeedMultiplier
                        //         },
                        //         roundDuration: evaluateExpression(trait[event].duration.rounds, {$rank: rank}),
                        //         source: {
                        //             character: sourceCharacter.id,
                        //             ability: trait
                        //         }
                        //     };
                        //     const existingEffect = state.combat.combatantCombatStats[affectedCharacterId].modifiers.find(modifier => {
                        //         return modifier.source.character === sourceCharacter.id && modifier.source.ability === trait;
                        //     });
                        //     if (existingEffect) {
                        //         existingEffect.roundDuration = trait[event].duration.rounds;
                        //     } else {
                        //         state.combat.combatantCombatStats[affectedCharacterId].modifiers.push(effect);
                        //     }
                        //     debugMessage(`Applied ${percentageSpeedMultiplier}% modifier to speed of ${affectedCharacterId}`);
                        //     break;
                        case "add_modifier":
                            const modifierToAddDefinition = trait[event].effects.add_modifier;
                            Object.keys(modifierToAddDefinition).forEach(effectType => {
                                const effectTarget = modifierToAddDefinition[effectType].target;
                                const modifier = {
                                    effects: {
                                        [effectType]: {
                                            percent: evaluateExpression(modifierToAddDefinition[effectType].percent, {$rank: rank})
                                        }
                                    },
                                    roundDuration: evaluateExpression(trait[event].duration.rounds, {$rank: rank}),
                                    source: {
                                        character: sourceCharacter.id,
                                        ability: trait
                                    }
                                };
                                // Determine targets
                                const targets = Object.keys(state.combat.combatantCombatStats).filter(combatantId => {
                                    switch (effectTarget) {
                                        case "attacker":
                                            return sourceCharacter.id == combatantId;
                                        case "attacked":
                                            return targetCharacter == combatantId;
                                        case "all_enemies":
                                            const actingCharacterParty = sourceCharacter.id === 0 ? 0 : 1;
                                            return actingCharacterParty !== state.combat.combatantCombatStats[combatantId].party;
                                        default:
                                            throw new Error();
                                    }
                                });
                                targets.forEach(combatantId => {
                                    const existingEffect = state.combat.combatantCombatStats[combatantId].modifiers.find(modifier => {
                                        return modifier.source.character === sourceCharacter.id && modifier.source.ability === trait;
                                    });
                                    if (existingEffect) {
                                        existingEffect.roundDuration = evaluateExpression(trait[event].duration.rounds, {$rank: rank});
                                    } else {
                                        state.combat.combatantCombatStats[combatantId].modifiers.push(modifier);
                                    }
                                    _.get(state, "attack.otherEffects", []).push({
                                        event: "add_modifier",
                                        source: sourceCharacter.id,
                                        target: combatantId,
                                        effect: modifier,
                                    });
                                });
                            })
                    }
                }
            );
        }
    }
    return state;
}

export function evaluateExpression(expression, context) {
    if(expression === null || expression === undefined) {
        return expression;
    }
    if (!expressionCache[expression]) {
        expressionCache[expression] = new Function("context", `with(context) {return ${expression}}`);
    }
    context.Decimal = Decimal;
    return expressionCache[expression].call(null, context);
}

export function getPowerNeededForLevel(level) {
    return evaluateExpression(config.mechanics.levelToPowerEquation, {
        $level: Decimal(level)
    });
}

export function getLevelForPower(powerPoints) {
    return evaluateExpression(config.mechanics.powerToLevelEquation, {
        $powerPoints: Decimal(powerPoints)
    });
}

export function reincarnateAs(monsterId, newAttributes) {
    const player = getCharacter(0);
    // Improve your starting traits
    const currentDemon = Creatures[player.appearance];
    if (currentDemon) {
        currentDemon.traits.forEach(trait => {
            if (!globalState.startingTraits[trait] || player.powerLevel.gt(globalState.startingTraits[trait])) {
                globalState.startingTraits[trait] = player.powerLevel;
            }
        });
    }

    if(Decimal(globalState.highestLevelReached).lt(player.powerLevel)) {
        globalState.highestLevelReached = player.powerLevel;
    }

    if (monsterId === "random") {
        const options = _.difference(Object.keys(Creatures).filter(m => {
            return _.get(globalState, ["debug", "creatures", m, "enabled"], true) &&
                Creatures[m].enabled !== false
        }), Object.keys(globalState.unlockedMonsters)
            .filter(m => globalState.unlockedMonsters[m]));
        monsterId = options[Math.floor(Math.random() * options.length)];
    }

    // Update player attributes
    Object.keys(player.attributes).forEach(attribute => {
        player.attributes[attribute] = Decimal(newAttributes[attribute.substring(1)]);
    })

    // Add your level to your starting energy.
    const latentPowerGain = evaluateExpression(config.mechanics.latentPowerGainOnReincarnate, {
        player
    })
    globalState.characters[0].latentPower = globalState.characters[0].latentPower.plus(latentPowerGain);
    globalState.characters[0].absorbedPower = Decimal(0);
    globalState.characters[0].reincarnate(monsterId, globalState.startingTraits);
    globalState.unlockedMonsters[monsterId] = true;

    // Gain the traits of your new demon amd your new power level
    Creatures[monsterId].traits.forEach(trait => {
        if (!globalState.startingTraits[trait] || player.powerLevel.gt(globalState.startingTraits[trait])) {
            globalState.startingTraits[trait] = player.powerLevel;
        }
    });
    getCharacter(0).traits = {...globalState.startingTraits};

    globalState.currentEncounter = null;
    globalState.currentAction = "reincarnating";
    getCharacter(0).currentHp = getCharacter(0).maximumHp;
    getGlobalState().passivePowerIncome = Decimal(0);

    saveGlobalState();
}

export function unpause() {
    globalState.paused = false;
}

function stateReviver(key, value) {
    switch (key) {
        case "_attributes":
        case "startingTraits":
        case "traits":
            return Object.keys(value).reduce((all, next) => {
                all[next] = Decimal(value[next]);
                return all;
            }, {});
        case "startingPower":
        case "minLevel":
        case "maxLevel":
            return Decimal(value);
        case "characters":
            return Object.keys(value).reduce((characters, id) => {
                characters[id] = new Character(value[id]);
                return characters;
            }, {});
        case "enemies":
            return Object.keys(value).map(character => {
                return new Character(value[character]);
            });
        case "paused":
            return false;
        case "passivePowerIncome":
            return Decimal(value);
        case "value":
            const parsed = Number.parseFloat(value);
            if (Number.isNaN(parsed)) {
                return value;
            }
            return Decimal(value);
        default:
            return value;
    }
}

export function resetDebug() {
    globalState.debug.creatures = {};
    globalState.debug.regions = {};
}

export function getManualSpeedMultiplier() {
    const debugMultiplier = _.get(globalState, ["debug", "manualSpeedMultiplier"]);
    const baseMultiplier = globalState.manualSpeedMultiplier;
    return debugMultiplier || baseMultiplier;
}