import CharacterCombatState from "../CharacterCombatState";
import {debugMessage} from "../../debugging";
import {getTrait} from "../../data/Traits";
import {Decimal} from "decimal.js";
import {config} from "../../config";
import {v4} from "node-uuid";
import {generateHitCombatResult, generateMissCombatResult, generateSkipActionResult} from "../../combatResult";
import {evaluateExpression, getCharacter} from "../index";
import * as _ from "lodash";
import {act} from "@testing-library/react";
import getHitChanceBy from "./getHitChanceBy";

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
    triggerEvent(Object.values(combatResult.combatantCombatStats), {type:"on_combat_start"}, 0, combatResult, rng);

    let tick = 0;
    while (combatResult.winner === null) {
        const initiatives = determineInitiatives(combatResult);
        Object.keys(initiatives).forEach(initiativeCount => {
            const actingCharacters = initiatives[initiativeCount];
            actingCharacters.forEach(actingCharacter => {
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
    const hitTypeChances = getHitChanceBy(actingCharacter).against(targetCharacter);
    const damageRoll = Math.floor(rng.double() * 100);
    let damageToInflict;
    if (damageRoll <= hitTypeChances.minimum) {
        damageToInflict = actingCharacter.damage.min;
        debugMessage(`Tick ${tick}: Damage roll ${damageRoll}, a glancing hit for ${damageToInflict}.`);
    } else if (damageRoll <= hitTypeChances.median.plus(hitTypeChances.minimum)) {
        damageToInflict = actingCharacter.damage.med;
        debugMessage(`Tick ${tick}: Damage roll ${damageRoll}, a solid hit for ${damageToInflict}.`);
    } else {
        damageToInflict = actingCharacter.damage.max;
        debugMessage(`Tick ${tick}: Damage roll ${damageRoll}, a critical hit for ${damageToInflict}.`);
    }
    const attackResult = {
        baseDamage: damageToInflict,
        attackerDamageMultiplier: actingCharacter.power,
        targetDefenseMultiplier: targetCharacter.resilience,
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
    targetCharacter.hp = targetCharacter.hp.minus(damageToInflict);
    attackResult.finalDamage = finalDamage;
    debugMessage(`Tick ${tick}: Hit did ${finalDamage.toFixed()}. Additional effects: ${attackResult.otherEffects.map(effect => {
        switch (effect.event) {
            case "apply_effect":
                return `Applying effect ${effect.effect} with from ${effect.source} to ${effect.target.id}.`
        }

    }).join(", ")}. Target has ${targetCharacter.hp} remaining.`)
    // TODO: Trigger on-damage effects
    triggerEvent(Object.values(combatResult.combatantCombatStats), {
        type:"on_taking_damage",
        attacker: actingCharacter,
        target: targetCharacter
    }, tick, combatResult, rng);
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
    const rankModifier = Decimal(sourceCharacter.attributes[config.mechanics.combat.traitRank.baseAttribute]).times(config.mechanics.combat.traitRank.attributeBonusScale).div(100);
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
                        const target = effect.conditions[condition].target === "attacker" ? sourceCharacter : targetCharacter;
                        const targetPercent = Decimal(effect.conditions[condition].below);
                        const targetCurrentHealth = targetCharacter.hp;
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
                            if (percentDamageModifier) {
                                const newMultiplier = state.attack.attackerDamageMultiplier.plus(percentDamageModifier);
                                debugMessage(`Tick ${tick}: Applying ${percentDamageModifier.toFixed()} modifier to damage, changing damage multiplier from ${state.attack.attackerDamageMultiplier.div(100).toFixed()} to ${newMultiplier.div(100).toFixed()}`);
                                state.attack.attackerDamageMultiplier = newMultiplier;
                            }
                            break;
                        case "damage":
                            const target = trait[event].effects.target
                            const damageToInflict = evaluateExpression(trait[event].effects.damage, {
                                $rank: Decimal(rank),
                                attackDamage: state.attack.finalDamage
                            }).floor();
                            debugMessage(`Inflicting ${damageToInflict} damage to ${target}`);
                            if(damageToInflict.gt(0)) {
                                const targets = selectTargets(sourceCharacter, targetCharacter, Object.keys(state.combat.combatantCombatStats), target, state);
                                targets.forEach(target => {
                                    state.attack.otherEffects.push({
                                        event: "damage",
                                        value: damageToInflict,
                                        target: target
                                    });
                                });
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
                                const targets = selectTargets(sourceCharacter, targetCharacter, Object.keys(state.combat.combatantCombatStats), effectTarget, state);
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

function makeAttackRoll(actingCharacter, target, combatState, rng) {
    const attackAccuracy = Decimal(actingCharacter.attributes[config.mechanics.combat.precision.baseAttribute]).times(config.mechanics.combat.precision.attributeBonusScale);
    // TODO: Validation
    debugMessage("Making an precision roll. Attacker Accuracy:", attackAccuracy.toFixed());
    const roll = Math.floor((rng.double() * 100));
    return {
        rawRoll: roll,
        attackAccuracy,
        total: attackAccuracy.plus(roll)
    };
}

function selectTargets(sourceCharacter, targetCharacterId, combatants, targetType, state) {
    return combatants.filter(combatant => {
        switch (targetType) {
            case "attacker":
                return sourceCharacter.id == combatant;
            case "attacked":
                return targetCharacterId == combatant;
            case "all_enemies":
                const actingCharacterParty = sourceCharacter.id === 0 ? 0 : 1;
                return actingCharacterParty !== state.combat.combatantCombatStats[combatant].party;
            default:
                throw new Error();
        }
    });
}

function triggerEvent(combatants, event, tick, state, rng) {
    combatants.forEach(combatant => Object.keys(combatant.traits).forEach(trait => {
        combatants.filter(other => other !== combatant).forEach(otherCombatant => {
            applyTrait(combatant, otherCombatant.id, getTrait(trait), combatant.traits[trait], event, state, 0, rng);
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