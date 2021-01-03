import CharacterCombatState from "../CharacterCombatState";
import {debugMessage} from "../../debugging";
import {getTrait} from "../../data/Traits";
import {Decimal} from "decimal.js";
import {config} from "../../config";
import {v4} from "node-uuid";
import {generateHitCombatResult, generateMissCombatResult, generateSkipActionResult} from "../../combatResult";
import {evaluateExpression, getCharacter} from "../index";
import * as _ from "lodash";
import getHitChanceBy from "./getHitChanceBy";
import calculateDamageBy from "./calculateDamageBy";

export function resolveCombat(rng, definition) {
    const combatResult = {
        rounds: [],
        winner: null,
        combatantCombatStats: {},
    }

    _.flatMap(definition.parties.map((party, partyIndex) => {
        return party.map((character) => {
            combatResult.combatantCombatStats[character.id] = new CharacterCombatState(character, partyIndex);
        })
    }));
    debugMessage("Beginning combat")
    // Trigger start of combat effects.
    triggerEvent(Object.values(combatResult.combatantCombatStats), {type:"on_combat_start"}, 0, {combat: combatResult, round: {effects: []}}, rng);

    let tick = 0;
    while (combatResult.winner === null) {
        const initiatives = determineInitiatives(combatResult);
        Object.keys(initiatives).forEach(initiativeCount => {
            const actingCharacters = initiatives[initiativeCount];
            actingCharacters.forEach(actingCharacter => {
                const beginningOfRoundEffects = [];
                triggerEvent(Object.values(combatResult.combatantCombatStats), {type: "on_round_start"}, tick, {combat: combatResult, round: {effects: beginningOfRoundEffects}}, rng);
                beginningOfRoundEffects.forEach(effect => {
                    combatResult.rounds.push(effect);
                });
                tick = actingCharacter.lastActed + actingCharacter.speed.toNumber();
                actingCharacter.lastActed = tick;
                debugMessage(`Tick ${tick}: Resolving action by character '${actingCharacter.id}'.`);
                if (actingCharacter.hp.lte(0)) {
                    debugMessage(`Tick ${tick}: Character ${actingCharacter.id} was dead when their turn to act came up, skipping their action.`);
                    return;
                }
                const enemyParty = (actingCharacter.party + 1) % 2;
                const livingEnemies = definition.parties[enemyParty]
                    .filter(enemy => combatResult.combatantCombatStats[enemy.id].hp.gt(0));
                const target = combatResult.combatantCombatStats[_.get(livingEnemies[Math.floor(rng.double() * livingEnemies.length)], "id")];
                if (target === undefined) {
                    debugMessage(`Tick ${tick}: No valid target, skipping action by ${actingCharacter.id}.`);
                    return;
                }
                if (actingCharacter.canAct) {
                    debugMessage(`Tick ${tick}: Attacking ${target}`);
                    const attackRollResult = makeAttackRoll(actingCharacter, target, combatResult, rng);
                    const attackOutcome = evaluateExpression(config.mechanics.combat.determineHit, {
                        roll: attackRollResult.total
                    });
                    switch (attackOutcome) {
                        case "hit":
                            debugMessage(`Tick ${tick}: ${actingCharacter.id} rolled ${attackRollResult.total}, a hit.`);
                            resolveHit(tick, combatResult, actingCharacter, target, rng);
                            break;
                        default:
                            debugMessage(`Tick ${tick}: ${actingCharacter.id} rolled ${attackRollResult.total}, a miss.`);
                            resolveMiss(tick, combatResult, actingCharacter, target, rng);
                        // TODO: Trigger on-miss effects
                    }
                } else {
                    debugMessage(`${tick}: Character skips their action.`);
                    resolveSkippedAction(tick, combatResult, actingCharacter);
                }
                Object.keys(combatResult.combatantCombatStats).forEach(combatantId => {
                    if (combatResult.combatantCombatStats[combatantId].hp.lte(0)) {
                        debugMessage(`Tick ${tick}: Combatant ${combatantId} died`);
                        combatResult.rounds.push({
                            uuid: v4(),
                            tick,
                            actor: actingCharacter.id,
                            target: Number.parseInt(combatantId),
                            result: "kill"
                        });
                    }
                });

                // TODO: Add logs for when effects expire.
                actingCharacter.modifiers = actingCharacter.modifiers
                    .map(modifier => {
                        modifier.roundDuration = Decimal(modifier.roundDuration).minus(1);
                        return modifier;
                    })
                    .filter(modifier => Decimal(modifier.roundDuration).gt(0));
                const endOfRoundEffects = [];
                triggerEvent(Object.values(combatResult.combatantCombatStats), {type:"on_round_end"}, tick, {
                    combat: combatResult,
                    round: {effects: endOfRoundEffects}
                }, rng);
                endOfRoundEffects.forEach(event => {
                    combatResult.rounds.push(event);
                })
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
            }

        } else {
            debugMessage("No winner, combat continues");
        }
    }
    return combatResult

}

function resolveHit(tick, combatResult, actingCharacter, targetCharacter, rng) {
    if (typeof actingCharacter !== "object") {
        throw new Error(`Acting character was not an object!`);
    }
    if (typeof targetCharacter !== "object") {
        throw new Error(`Target character was not an object!`);
    }
    const hitTypeChances = getHitChanceBy(getCharacter(actingCharacter.id)).against(getCharacter(targetCharacter.id));
    const damageRoll = Math.floor(rng.double() * 100);
    let damageToInflict;
    if (damageRoll <= hitTypeChances.min) {
        damageToInflict = actingCharacter.damage.min;
        debugMessage(`Tick ${tick}: Damage roll ${damageRoll}, a glancing hit for ${damageToInflict}.`);
    } else if (damageRoll <= hitTypeChances.med.plus(hitTypeChances.min)) {
        damageToInflict = actingCharacter.damage.med;
        debugMessage(`Tick ${tick}: Damage roll ${damageRoll}, a solid hit for ${damageToInflict}.`);
    } else {
        damageToInflict = actingCharacter.damage.max;
        debugMessage(`Tick ${tick}: Damage roll ${damageRoll}, a critical hit for ${damageToInflict}.`);
    }
    const attackResult = {
        baseDamage: damageToInflict,
        attackMultiplier: actingCharacter.power.times(config.mechanics.combat.power.effectPerPoint),
        defenseDivisor: targetCharacter.resilience.times(config.mechanics.combat.resilience.effectPerPoint),
        otherEffects: []
    }
    // Trigger on-hit effects
    triggerEvent(Object.values(combatResult.combatantCombatStats), {type:"on_hitting"}, tick, {combat: combatResult, attack: attackResult}, rng);
    const damageMultiplier = attackResult.attackMultiplier.plus(100).div(attackResult.defenseDivisor.plus(100));
    const finalDamage = attackResult.baseDamage.times(damageMultiplier).ceil();

    debugMessage(`Damage started off as ${attackResult.baseDamage.toFixed()}, with an attack factor of ${attackResult.attackMultiplier} and a target defense factor of ${attackResult.defenseDivisor}, for a total factor of ${damageMultiplier} and a final damage of ${finalDamage.toFixed()}`);
    targetCharacter.hp = targetCharacter.hp.minus(finalDamage);
    attackResult.finalDamage = finalDamage;
    debugMessage(`Tick ${tick}: Hit did ${finalDamage.toFixed()}. Additional effects: ${attackResult.otherEffects.map(effect => {
        switch (effect.event) {
            case "apply_effect":
                return `Applying effect ${effect.effect} with from ${effect.source} to ${effect.target.id}.`
            case "add_statuses":
                return `Adding status ${effect.status} with rank ${effect.rank} to ${effect.target}`;
        }

    }).join(", ")}. Character ${targetCharacter.id} has ${targetCharacter.hp} remaining.`)
    // TODO: Trigger on-damage effects
    triggerEvent(Object.values(combatResult.combatantCombatStats), {
        type:"on_taking_damage",
        attacker: actingCharacter,
        target: targetCharacter
    }, tick, {combat: combatResult, attack: attackResult}, rng);
    attackResult.otherEffects.forEach(effect => {
        switch (effect.event) {
            case "damage":
                combatResult.combatantCombatStats[effect.target].hp = combatResult.combatantCombatStats[effect.target].hp.minus(effect.value);
                break;
        }
    })
    combatResult.rounds.push(generateHitCombatResult(tick, actingCharacter.id, targetCharacter.id, finalDamage, attackResult.otherEffects));
}

function resolveMiss(tick, combatResult, actingCharacter, targetCharacter, rng) {
    combatResult.rounds.push(generateMissCombatResult(tick, actingCharacter.id, targetCharacter.id));
}

function resolveSkippedAction(tick, combatResult, actingCharacter) {
    combatResult.rounds.push(generateSkipActionResult(tick, actingCharacter.id));
}

function applyTrait(sourceCharacter, targetCharacter, trait, rank, event, state, tick, rng) {
    const eventType = event.type;
    const recordedEffects = roundEvents.includes(eventType) ? state.round.effects : state.attack.effects;
    const rankModifier = Decimal(sourceCharacter.attributes[config.mechanics.combat.traitRank.baseAttribute]).times(config.mechanics.combat.traitRank.effectPerPoint).div(100);
    rank = Decimal.min(Decimal(rank).plus(Decimal(rank).times(rankModifier)).floor(), 100);
    debugMessage(`Character has a bonus to rank of ${sourceCharacter.attributes.madness.toFixed()}% from madness, for an effective rank of ${rank}`);
    debugMessage(`Tick ${tick}: Determining if trait ${trait.name} applies`);
    if (trait[eventType]) {
        const effect = trait[eventType];
        if (effect.conditions !== undefined) {
            debugMessage("Trait has conditions");
        }
        const effectTriggers = effect.conditions === undefined || Object.keys(effect.conditions)
            .every(condition => {
                switch (condition) {
                    case "health_percentage":
                        // Fixme: Implement validation
                        const target = effect.conditions[condition].target === "attacker" ? sourceCharacter : targetCharacter;
                        const targetPercent = Decimal(effect.conditions[condition].below);
                        const targetCurrentHealth = targetCharacter.hp;
                        const targetMaxHealth = target.maximumHp;
                        const currentHealthPercent = (targetCurrentHealth.mul(100).div(targetMaxHealth));
                        const conditionMet = targetPercent.gte(currentHealthPercent);
                        debugMessage(`Tick ${tick}: Target health percentage is ${currentHealthPercent}, which is ${conditionMet ? "" : "not"} enough to trigger.`);
                        return conditionMet;
                    case "chance":
                        const chanceToTrigger = evaluateExpression(trait[eventType].conditions[condition], {
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
            Object.keys(trait[eventType].effects).forEach(traitEffect => {
                    // FIXME
                    switch (traitEffect) {
                        case "damage_modifier":
                            // FIXME: Validation
                            const percentDamageModifier = evaluateExpression(trait[eventType].effects[traitEffect].percent, {
                                $rank: rank
                            });
                            if (percentDamageModifier) {
                                const newMultiplier = state.attack.attackMultiplier.plus(percentDamageModifier);
                                debugMessage(`Tick ${tick}: Applying ${percentDamageModifier.toFixed()} modifier to damage, changing damage multiplier from ${state.attack.attackMultiplier.div(100).toFixed()} to ${newMultiplier.div(100).toFixed()}`);
                                state.attack.attackMultiplier = newMultiplier;
                            }
                            break;
                        case "damage":
                            const target = trait[eventType].effects.target
                            const damageToInflict = evaluateExpression(trait[eventType].effects.damage, {
                                $rank: Decimal(rank),
                                attackDamage: state.attack.finalDamage
                            }).floor();
                            debugMessage(`Inflicting ${damageToInflict} damage to ${target}`);
                            if(damageToInflict.gt(0)) {
                                const targets = selectTargets(sourceCharacter, targetCharacter, Object.values(state.combat.combatantCombatStats), target, state);
                                targets.forEach(target => {
                                    recordedEffects.push({
                                        event: "damage",
                                        value: damageToInflict,
                                        target: target
                                    });
                                });
                            }
                            break;
                        case "defense_modifier": {
                            const defenseModifier = evaluateExpression(trait[eventType].effects[traitEffect].percent, {
                                $rank: rank
                            }).div(100).plus(1);
                            const newMultiplier = state.attack.defenseDivisor.times(defenseModifier);
                            debugMessage(`Tick ${tick}: Applying ${defenseModifier} modifier to defense, changing defense multiplier from ${state.attack.defenseDivisor.toFixed()} to ${newMultiplier.toFixed()}`);
                            state.attack.defenseDivisor = newMultiplier;
                            break;
                        }
                        case "add_statuses":
                            const statusesDefinition = trait[eventType].effects.add_statuses;
                            Object.keys(statusesDefinition).forEach(statusType => {
                                const effectTarget = statusesDefinition[statusType].target;
                                // Determine targets
                                const targets = selectTargets(sourceCharacter, targetCharacter, Object.values(state.combat.combatantCombatStats), effectTarget, state);
                                const statusLevel = evaluateExpression(statusesDefinition[statusType].rank, {
                                    rank
                                });
                                targets.forEach(combatant => {
                                    const existingLevel = Decimal(combatant.statuses[statusType] || 0);
                                    if(existingLevel.lt(statusLevel)) {
                                        combatant.statuses[statusType] = statusLevel;
                                        recordedEffects.push({
                                            result: "add_statuses",
                                            source: sourceCharacter.id,
                                            target: combatant.id,
                                            status: statusType,
                                            level: statusLevel,
                                            tick
                                        });
                                    }
                                });
                            })
                    }
                }
            );
        }
    }
    return state;
}

function makeAttackRoll(actingCharacter, target, combatState, rng) {
    // TODO: Validation
    const roll = Math.floor((rng.double() * 100));
    return {
        rawRoll: roll,
        total: roll
    };
}

function selectTargets(sourceCharacter, targetCharacter, combatants, targetType, state) {
    return combatants.filter(combatant => {
        switch (targetType) {
            case "attacker":
                return sourceCharacter.id == combatant.id;
            case "attacked":
                return targetCharacter.id == combatant.id;
            case "all_enemies":
                const actingCharacterParty = sourceCharacter.id === 0 ? 0 : 1;
                return actingCharacterParty !== state.combat.combatantCombatStats[combatant].party;
            default:
                throw new Error();
        }
    });
}

function triggerEvent(combatants, event, tick, state, rng) {
    debugMessage(`Triggering event ${event.type}`);
    combatants.forEach(combatant => Object.keys(combatant.traits).forEach(trait => {
        combatants.filter(other => other !== combatant).forEach(otherCombatant => {
            applyTrait(combatant, otherCombatant, getTrait(trait), combatant.traits[trait], event, state, tick, rng);
        });
    }));
}

function determineInitiatives(state) {
    const combatants = Object.values(state.combatantCombatStats);
    return combatants.reduce((initiatives, combatant) => {
        if(initiatives[combatant.speed.toNumber()]) {
            initiatives[combatant.speed.toNumber()].push(combatant);
        } else {
            initiatives[combatant.speed.toNumber()] = [combatant];
        }
        return initiatives;
    }, {});
}

const roundEvents = ["on_round_start", "on_combat_start", "on_round_end"];