import CharacterCombatState from "../CharacterCombatState";
import {debugMessage} from "../../debugging";
import {getTrait} from "../../data/Traits";
import {Decimal} from "decimal.js";
import {config} from "../../config";
import {v4} from "node-uuid";
import {generateHitCombatResult, generateMissCombatResult, generateSkipActionResult} from "../../combatResult";
import {evaluateExpression, getCharacter} from "../index";
import * as _ from "lodash";

export function resolveCombat(rng, definition) {
    const combatResult = {
        rounds: [],
        winner: null,
        combatantCombatStats: {}
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
    while(combatResult.winner === null) {
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
                    if (attackRollResult.total >= (100 - config.combat.baseHitChance)) {
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