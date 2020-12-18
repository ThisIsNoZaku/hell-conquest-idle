import * as _ from "lodash";
import {assertCreatureExists, Creatures} from "./data/creatures";
import {v4} from "node-uuid";
import {getTrait} from "./data/Traits";
import {debugMessage} from "./debugging";
import Big from "big.js";
import {Character} from "./character";
import {config} from "./config";
import {generateHitCombatResult, generateMissCombatResult} from "./combatResult";

const saveKey = "hell-save";

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
            combatResult.combatantCombatStats[character.id] = {
                hp: character.currentHp,
                fatigue: 0
            };
            return {
                character,
                party: partyIndex
            }
        })
    }));
    debugMessage("Beginning combat")
    const initiatives = _.uniq(combatants.map(combatant => 100 - combatant.character.attributes.cunning));
    let tick = 0;
    const resolveRound = async function () {
        initiatives.forEach(initiativeCount => {
            tick += initiativeCount;
            debugMessage(`Resolving round on tick ${initiativeCount}`);
            // TODO: Activate/deactivate traits
            const actingCharacters = combatants
                .filter(wrapped => wrapped.character.alive && (initiativeCount % Math.ceil(100 - wrapped.character.attributes.cunning) === 0));
            actingCharacters.forEach(acting => {
                const character = acting.character;
                debugMessage(`Tick ${tick}: Character ${character.id} acting on tick ${tick}`);
                if (combatResult.combatantCombatStats[character.id].hp === 0) {
                    debugMessage(`Tick ${tick}: ${character.id} was dead when their turn to act came up, skipping their action.`);
                    return;
                }
                // The acting character performs an attack.
                const enemyParty = (acting.party + 1) % 2;
                const livingEnemies = definition.parties[enemyParty]
                    .filter(enemy => combatResult.combatantCombatStats[enemy.id].hp > 0);
                const target = _.get(livingEnemies[Math.floor(rng.double() * livingEnemies.length)], "id");
                if (target === undefined) {
                    debugMessage(`Tick ${tick}: No valid target, skipping attacking`);
                    return;
                }
                debugMessage(`Tick ${tick}: Attacking ${target}`);
                const attackRoll = makeAttackRoll(character, target, rng);
                if (_.isNaN(attackRoll)) {
                    throw new Error("Attack roll was NaN")
                }

                // Trigger on-attack effects
                if (attackRoll >= 50) {
                    debugMessage(`Tick ${tick}:  Attack roll was ${attackRoll}, a hit`);
                    resolveHit(tick, combatResult, character, target, rng);
                    listeners.forEach(notifyListener);
                } else {
                    debugMessage(`Tick ${tick}:  Attack roll was ${attackRoll}, a miss`);
                    resolveMiss(tick, combatResult, character, target, rng);
                    listeners.forEach(notifyListener);
                    // TODO: Trigger on-miss effects
                }
                Object.keys(combatResult.combatantCombatStats).forEach(combatantId => {
                    if (combatResult.combatantCombatStats[combatantId].hp <= 0) {
                        debugMessage(`Tick ${tick}: Combatant ${combatantId} died`);
                        combatResult.rounds.push({
                            uuid: v4(),
                            tick,
                            actor: character.id,
                            target: combatantId,
                            result: "kill"
                        });
                        listeners.forEach(notifyListener);
                    }
                });
                combatResult.combatantCombatStats[acting.character.id].fatigue++;
            });
        });
        if (definition.parties[0].every(character => combatResult.combatantCombatStats[character.id].hp <= 0)) {
            debugMessage("Every member of party 0 is dead")
            combatResult.rounds.push({
                uuid: v4(),
                tick,
                winner: 1,
                result: "combat-end"
            })
            combatResult.winner = 1;
            listeners.forEach(notifyListener);
        } else if (definition.parties[1].every(character => combatResult.combatantCombatStats[character.id].hp <= 0)) {
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

function makeAttackRoll(actingCharacter, target, rng) {
    const attackAccuracy = getCharacter(target).attributes.cunning;
    const targetEvasion = getCharacter(target).attributes.deceit;
    debugMessage("Making an attack roll. Attacker Accuracy:", attackAccuracy, "Target Evasion:", targetEvasion);
    return Math.floor((rng.double() * 100) + attackAccuracy - targetEvasion);
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
        unlockedMonsters: {},
        paused: true,
        currentAction: "reincarnating",
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
                    brutality: 0,
                    cunning: 0,
                    deceit: 0,
                    madness: 0
                },
                combat: {
                    fatigue: 0,
                    minimumDamageMultiplier: .5,
                    medianDamageMultiplier: 1,
                    maximumDamageMultiplier: 1.5
                }
            })
        },
        tutorials: {

        }
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
    const artifacts = [];
    const hasItemRoll = Math.floor(rng.double() * 100);
    if (hasItemRoll < 10) {
        artifacts.push(generateItem());
    }
    const nextId = nextMonsterId++;
    globalState.characters[nextId] = new Character({
        id: nextId,
        ...Creatures[id],
        traits: Creatures[id].traits.reduce((traits, next) => {
            traits[next] = powerLevel;
            return traits;
        }, {}),
        powerLevel,
        currentHp: powerLevel.mul(5),
        artifacts: [],
        statuses: [],
        attributes: {
            brutality: 0,
            cunning: 0,
            deceit: 0,
            madness: 0
        },
        combat: {
            fatigue: 0,
            minimumDamageMultiplier: .5,
            medianDamageMultiplier: 1,
            maximumDamageMultiplier: 1.5
        }
    });
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
        uuid: v4(),
        tick,
        actor: actingCharacter,
        target: targetCharacter,
        result: "hit",
        effects: [
            {
                event: "damage",
                target: targetCharacter,
                value: damageToInflict
            }
        ]
    };
    Object.keys(actingCharacter.traits).forEach(trait => applyTrait(getTrait(trait), actingCharacter.traits[trait], "on_hit", {combat: combatResult, attack: attackResult}, tick));
    // Trigger on-hit effects
    combatResult.combatantCombatStats[targetCharacter].hp -= damageToInflict;
    debugMessage(`Tick ${tick}: Hit did ${attackResult.effects.map(effect => {
        switch (effect.event) {
            case "damage":
                return `${effect.value} damage`
        }
        
    }).join(", ")}. Target has ${combatResult.combatantCombatStats[targetCharacter].hp} remaining.`)
    // TODO: Trigger on-damage effects
    combatResult.rounds.push(attackResult);
}

function resolveMiss(tick, combatResult, actingCharacter, targetCharacter, rng) {
    combatResult.rounds.push({
        uuid: v4(),
        tick,
        target: targetCharacter,
        actor: actingCharacter,
        result: "miss",
        effects: []
    });
}

function generateItem() {

}

function applyTrait(trait, rank, event, state, tick) {
    debugMessage(`Tick ${tick}: Determining if trait ${trait.name} applies`);
    if (trait[event]) {
        const effect = trait[event];
        if(effect.when !== undefined) {
            debugMessage("Trait has triggers");
        }
        const effectTriggers = effect.when === undefined || Object.keys(effect.when)
            .every(trigger => {
                switch (trigger) {
                    case "target_health_below_percentage":
                        const targetPercent = effect.when[trigger];
                        const targetHealthPercent = (100 * state.combat.combatantCombatStats[state.attack.target].hp / getCharacter(state.attack.target).maximumHp);
                        const triggerMet = targetPercent >= targetHealthPercent;
                        debugMessage(`Tick ${tick}: Target health percentage is ${targetHealthPercent}, which is ${triggerMet ? "" : "not"} enough to trigger.`);
                        return triggerMet;
                    default:
                        return false;
                }
            })
        if (effectTriggers) {
            debugMessage(`Tick ${tick}: Effect triggered, applying effects`);
            Object.keys(trait[event].effects).forEach(traitEffect => {
                switch (traitEffect) {
                    case "damage_bonus_percent":
                        state.attack.effects.forEach(effect => {
                            if (effect.event == "damage") {
                                const damageModifier = evaluateExpression(trait[event].effects[traitEffect], {
                                    $rank: rank
                                });
                                if(Number.isNaN(damageModifier)) {
                                    throw new Error("Damage modifier somehow was NaN");
                                }
                                debugMessage(`Tick ${tick}: Applying ${damageModifier} percentage modifier to damage`);
                                effect.value = Math.floor(effect.value * ((100 + damageModifier)/100));
                            }
                        });
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

export function reincarnateAs(monsterId) {
    if(monsterId === "random") {
        const options = _.difference(Object.keys(Creatures), Object.keys(globalState.unlockedMonsters)
            .filter(m => globalState.unlockedMonsters[m]));
        monsterId = options[Math.floor(Math.random() * options.length)];
        globalState.unlockedMonsters[monsterId] = true;
    }
    // Improve your starting traits
    if(globalState.characters[0].powerLevel > 1) {
        Object.keys(globalState.characters[0].traits).forEach(trait => {
            globalState.startingTraits = _.get(globalState.startingTraits, trait, 0) + globalState.characters[0].traits[trait] / 10;
        });
    }
    // Add your level to your starting energy.
    globalState.startingPower = globalState.startingPower.plus(globalState.characters[0].powerLevel.minus(1));
    globalState.absorbedPower = globalState.startingPower;
    globalState.characters[0].reincarnate(monsterId, globalState.startingTraits);
    globalState.currentAction = "exploring";

    saveGlobalState();
}

export function unpause() {
    globalState.paused = false;
}

function stateReviver(key, value) {
    switch (key) {
        case "startingTraits":
        case "traits":
            return Object.keys(value).reduce((traits, nextTrait) => {
                traits[nextTrait] = Big(value[nextTrait]);
                return traits;
            }, {});
        case "startingPower":
            return Big(value);
        case "characters":
        case "enemies":
            return Object.keys(value).reduce((characters, id) => {
                characters[id] = new Character(value[id]);
                return characters;
            }, {});
        default:
            return value;
    }
}