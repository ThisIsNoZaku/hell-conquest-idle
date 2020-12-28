import * as _ from "lodash";
import {assertCreatureExists, Creatures} from "../data/creatures";
import {v4} from "node-uuid";
import {getTrait} from "../data/Traits";
import {debugMessage} from "../debugging";
import Big from "big.js";
import {Character} from "../character";
import {config} from "../config";
import {generateHitCombatResult, generateMissCombatResult} from "../combatResult";
import CharacterCombatState from "./CharacterCombatState";
import * as Package from "../../package.json";

export const saveKey = require("md5")(`hell-conquest-${Package.version}`);

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
            });
            return {
                character,
                party: partyIndex
            }
        })
    }));
    debugMessage("Beginning combat")
    let tick = 0;
    const resolveRound = async function () {
        const initiatives = _.uniq(combatants.map(combatant => Math.floor(Big(10000).div(combatResult.combatantCombatStats[combatant.character.id].speed).toNumber())))
            .sort((a, b) => a - b);
        initiatives.forEach(initiativeCount => {
            debugMessage(`Resolving round on tick ${tick}`);
            // TODO: Activate/deactivate traits
            const actingCharacters = combatants
                .filter(wrapped => {
                    const isAlive = wrapped.character.alive;
                    const characterSpeed = Math.floor(Big(10000).div(combatResult.combatantCombatStats[wrapped.character.id].speed).toNumber());
                    const matchingSpeed = (initiativeCount % characterSpeed === 0)
                    return isAlive && matchingSpeed;
                });
            actingCharacters.forEach(acting => {
                const character = acting.character;
                tick = combatResult.combatantCombatStats[character.id].lastActed + Math.floor(Big(10000).div(combatResult.combatantCombatStats[character.id].speed).toNumber());
                combatResult.combatantCombatStats[character.id].lastActed = tick;
                debugMessage(`Tick ${tick}: Resolving action by ${character.id}.`);
                if (combatResult.combatantCombatStats[character.id].hp.lte(0)) {
                    debugMessage(`Tick ${tick}: Character ${character.id} was dead when their turn to act came up, skipping their action.`);
                    return;
                }
                // The acting character performs an attack.
                const enemyParty = (acting.party + 1) % 2;
                const livingEnemies = definition.parties[enemyParty]
                    .filter(enemy => combatResult.combatantCombatStats[enemy.id].hp.gt(0));
                const target = _.get(livingEnemies[Math.floor(rng.double() * livingEnemies.length)], "id");
                if (target === undefined) {
                    debugMessage(`Tick ${tick}: No valid target, skipping action by ${character.id}.`);
                    return;
                }
                debugMessage(`Tick ${tick}: Attacking ${target}`);
                const attackRollResult = makeAttackRoll(character, target, combatResult, rng);

                // Trigger on-attack effects
                if (attackRollResult.total >= 50) {
                    debugMessage(`Tick ${tick}: ${character.id} rolled ${attackRollResult.total}, a hit.`);
                    resolveHit(tick, combatResult, character, target, rng);
                    listeners.forEach(notifyListener);
                } else {
                    debugMessage(`Tick ${tick}: ${character.id} rolled ${attackRollResult.total}, a miss.`);
                    resolveMiss(tick, combatResult, character, target, rng);
                    listeners.forEach(notifyListener);
                    // TODO: Trigger on-miss effects
                }
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
                    .filter(modifier => modifier.roundDuration > 0)
                    .map(modifier => {
                        modifier.roundDuration -= 1;
                        return modifier
                    })
            });
        });
        if (definition.parties[0].every(character => combatResult.combatantCombatStats[character.id].hp.lte(0))) {
            debugMessage("Every member of party 0 is dead")
            combatResult.rounds.push({
                uuid: v4(),
                tick,
                winner: 1,
                result: "combat-end"
            })
            combatResult.winner = 1;
            listeners.forEach(notifyListener);
        } else if (definition.parties[1].every(character => combatResult.combatantCombatStats[character.id].hp.lte(0))) {
            debugMessage("Every member of party 1 is dead")
            combatResult.rounds.push({
                uuid: v4(),
                tick,
                winner: 0,
                result: "combat-end",
            });
            combatResult.winner = 0;
            listeners.forEach(notifyListener);
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

function makeAttackRoll(actingCharacter, target, combatState,  rng) {
    const attackAccuracy = actingCharacter.attributes[config.mechanics.attack.baseAttribute].times(config.mechanics.attack.scale);
    if(attackAccuracy.constructor.name !== "Big") {
        throw new Error("Accuracy had the wrong type!");
    }
    const targetEvasion = getCharacter(target).attributes[config.mechanics.evasion.baseAttribute].times(config.mechanics.evasion.scale).minus(combatState.combatantCombatStats[target].fatigue);
    if(targetEvasion.constructor.name !== "Big") {
        throw new Error("Evasion had the wrong type");
    }
    debugMessage("Making an attack roll. Attacker Accuracy:", attackAccuracy.toFixed(), "Target Evasion:", targetEvasion.toFixed());
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
        unlockedMonsters: {},
        paused: true,
        currentAction: null,
        nextAction: null,
        id: 0,
        startingPower: Big(0), //The amount of absorbed power the player starts with when they reincarnate
        startingTraits: {},
        currentEncounter: null,
        manualSpeedMultiplier: config.manualSpeedup.multiplier,
        currentRegion: "forest",
        actionLog: [],
        exploration: {
            explorationTime: 15 * 1000,
            approachTime: 15 * 1000,
            combatTime: 10 * 1000,
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
                powerLevel: Big(1),
                absorbedPower: Big(0),
                appearance: "",
                currentHp: Big(5),
                statuses: {},
                traits: {},
                items: [],
                attributes: {
                    brutality: Big(0),
                    cunning: Big(0),
                    deceit: Big(0),
                    madness: Big(0)
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
        traits: Creatures[id].traits.reduce((traits, next) => {
            traits[next] = powerLevel;
            return traits;
        }, {}),
        absorbedPower: getPowerNeededForLevel(powerLevel),
        currentHp: powerLevel.mul(5),
        artifacts: [],
        statuses: [],
        attributes: {
            brutality: Big(0),
            cunning: Big(0),
            deceit: Big(0),
            madness: Big(0)
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
    damageToInflict = damageToInflict.plus(damageToInflict
        .times(Big(actingCharacter.attributes[config.mechanics.attackDamage.baseAttribute]).div(100)).round(0, 0));
    const attackResult = generateHitCombatResult(tick, actingCharacter.id, targetCharacter, damageToInflict);
    // Trigger on-hit effects
    Object.keys(actingCharacter.traits).forEach(trait => applyTrait(actingCharacter, targetCharacter, getTrait(trait), actingCharacter.traits[trait], "on_hitting", {
        combat: combatResult,
        attack: attackResult
    }, tick, rng));
    combatResult.combatantCombatStats[targetCharacter].hp = combatResult.combatantCombatStats[targetCharacter].hp.minus(damageToInflict);
    debugMessage(`Tick ${tick}: Hit did ${attackResult.effects.map(effect => {
        switch (effect.event) {
            case "damage":
                return `${effect.value} damage`;
            case "apply_effect":
                return `Applying effect ${effect.effect} with from ${effect.source} to ${effect.target}.`
        }

    }).join(", ")}. Target has ${combatResult.combatantCombatStats[targetCharacter].hp} remaining.`)
    // TODO: Trigger on-damage effects
    combatResult.rounds.push(attackResult);
}

function resolveMiss(tick, combatResult, actingCharacter, targetCharacterId, rng) {
    combatResult.rounds.push(generateMissCombatResult(tick, actingCharacter.id, targetCharacterId));
}

function applyTrait(sourceCharacter, targetCharacter, trait, rank, event, state, tick, rng) {
    const rankModifier = sourceCharacter.attributes[config.mechanics.traitRank.baseAttribute].times(config.mechanics.traitRank.scale).div(100);
    rank = Big(rank).plus(Big(rank).times(rankModifier)).round(0, 0);
    debugMessage(`Character has a bonus to rank of ${sourceCharacter.attributes.madness.toFixed()}% from madness, for an effective rank of ${rank}`);
    debugMessage(`Tick ${tick}: Determining if trait ${trait.name} applies`);
    if (trait[event]) {
        const effect = trait[event];
        if (effect.conditions !== undefined) {
            debugMessage("Trait has conditions");
        }
        const effectConditions = effect.conditions === undefined || Object.keys(effect.conditions)
            .every(condition => {
                switch (condition) {
                    case "health_percentage":
                        // Fixme: Implement validation
                        const target = getCharacter(effect.conditions[condition].target === "attacker" ? sourceCharacter : targetCharacter);
                        const targetPercent = Big(effect.conditions[condition].below);
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
                        if(chanceToTrigger <= roll) {
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
        if (effectConditions) {
            debugMessage(`Tick ${tick}: Effect triggered, applying effects`);
            Object.keys(trait[event].effects).forEach(traitEffect => {
                switch (traitEffect) {
                    case "damage_bonus":
                        state.attack.effects.forEach(effect => {
                            if (effect.event == "damage") {
                                // FIXME: Validation
                                const damageModifier = Big(trait[event].effects[traitEffect].percent ? effect.value * (evaluateExpression(trait[event].effects[traitEffect].percent, {
                                    $rank: rank
                                }) / 100) :evaluateExpression(trait[event].effects[traitEffect].static, {
                                    $rank: rank
                                }));
                                if (Number.isNaN(damageModifier)) {
                                    throw new Error("Damage modifier somehow was NaN");
                                }
                                debugMessage(`Tick ${tick}: Applying ${damageModifier} modifier to damage`);
                                effect.value = damageModifier.plus(effect.value).round(0, 0);
                            }
                        });
                        break;
                    case "speed_modifier":
                        const percentageSpeedMultiplier = evaluateExpression(trait[event].effects[traitEffect].percent, {
                            $rank: rank
                        });
                        const affectedCharacterId = trait[event].effects[traitEffect].target === "attacked" ? targetCharacter : sourceCharacter.id;
                        const effect = {
                            effect: {
                                speed_bonus_percent: percentageSpeedMultiplier
                            },
                            roundDuration: trait[event].duration.rounds,
                            source: {
                                character: sourceCharacter.id,
                                ability: trait
                            }
                        };
                        const existingEffect = state.combat.combatantCombatStats[affectedCharacterId].modifiers.find(modifier => {
                            return modifier.source.character === sourceCharacter.id && modifier.source.ability === trait;
                        });
                        if(existingEffect) {
                            existingEffect.roundDuration = trait[event].duration.rounds;
                        } else {
                            state.combat.combatantCombatStats[affectedCharacterId].modifiers.push(effect);
                        }
                        state.attack.effects.push({
                            event: "apply_effect",
                            source: sourceCharacter.id,
                            target: affectedCharacterId,
                            effect: traitEffect,
                            value: percentageSpeedMultiplier
                        });
                        debugMessage(`Applied ${percentageSpeedMultiplier}% modifier to speed of ${affectedCharacterId}`);
                        break;
                }
            });
        }
    }
    return state;
}

const expressionCache = {};

function evaluateExpression(expression, context) {
    if (!expressionCache[expression]) {
        expressionCache[expression] = new Function("$rank", `return ${expression}`);
    }
    return expressionCache[expression].call(null, context.$rank);
}

export function getPowerNeededForLevel(level) {
    return Big(level.minus(1).pow(2).times(5));
}

export function getLevelForPower(powerPoints) {
    return Big(0).eq(powerPoints) ? Big(1) : powerPoints.plus(1).div(5).sqrt().round(0, 3);
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
        player.attributes[attribute] = Big(newAttributes[attribute.substring(1)]);
    })

    // Add your level to your starting energy.
    globalState.startingPower = globalState.startingPower.plus(globalState.characters[0].powerLevel.minus(1).pow(2));
    globalState.characters[0].absorbedPower = globalState.startingPower;
    globalState.characters[0].reincarnate(monsterId, globalState.startingTraits);
    globalState.unlockedMonsters[monsterId] = true;

    // Gain the traits of your new demon amd your new power level
    Creatures[monsterId].traits.forEach(trait => {
        if (!globalState.startingTraits[trait] || player.powerLevel.gt(globalState.startingTraits[trait])) {
            globalState.startingTraits[trait] = player.powerLevel;
        }
    });

    globalState.currentEncounter = null;
    globalState.currentAction = "reincarnating";
    getCharacter(0).currentHp = getCharacter(0).maximumHp;

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
                all[next] = Big(value[next]);
                return all;
            }, {});
        case "startingPower":
        case "minLevel":
        case "maxLevel":
            return Big(value);
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
        case "value":
            const parsed = Number.parseFloat(value);
            if(Number.isNaN(parsed)) {
                return value;
            }
            return Big(value);
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