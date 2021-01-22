import {debugMessage} from "../../../debugging";
import evaluateExpression from "../../general/evaluateExpression";
import Decimal from "decimal.js";
import {v4} from "node-uuid";
import selectConditionTargets from "./selectConditionTargets";
import * as _ from "lodash";
import {generateDamageEvent, generateStaminaChangeEvent} from "../../events/generate";
import {getCharacter} from "../../index";

export default function applyTraitEffects(effectsToApply, event, traitId) {
    for (const effect of Object.keys(effectsToApply)) {
        debugMessage(`Applying trait effect ${effect}`);
        const effectDefinition = effectsToApply[effect];
        switch (effect) {
            case "add_statuses":
                Object.keys(effectDefinition).forEach(status => {
                    const targets = selectConditionTargets(effectDefinition[status].target, event.source.character, event.target, event.combatants);
                    const stacks = evaluateExpression(effectDefinition[status].stacks, {
                        rank: Decimal(event.source.character.traits[traitId])
                    });
                    const max = evaluateExpression(effectDefinition[status].max, {
                        rank: Decimal(event.source.character.traits[traitId])
                    });
                    const duration = evaluateExpression(effectDefinition[status].duration, {});
                    targets.forEach(target => {
                        const statusUuid = v4();
                        const existingStatus = (target.statuses[status] || [])
                            .find(s => {
                                return s.source.character === event.source.character.id &&
                                    s.source.trait === traitId;
                            });
                        if (existingStatus) {
                            existingStatus.duration = duration;
                            existingStatus.stacks = effectDefinition[status].cumulative ?
                                Decimal.min(existingStatus.stacks.plus(stacks), max) :
                                stacks;
                        } else {
                            target.statuses[status] = (target.statuses[status] || []);
                            target.statuses[status].push({
                                uuid: statusUuid,
                                source: {
                                    character: event.source.character.id,
                                    trait: traitId
                                },
                                duration,
                                stacks
                            });
                        }
                        if (duration < 999) {
                            event.roundEvents.push({
                                uuid: statusUuid,
                                event: "add-status",
                                source: {
                                    character: event.source.character.id,
                                    trait: traitId
                                },
                                target: target.id,
                                duration,
                                status,
                                stacks
                            });
                        }
                    })

                });
                break;
            case "remove_statuses":
                Object.keys(effectDefinition).forEach(status => {
                    const targets = selectConditionTargets(effectDefinition[status].target, event.source.character, event.combatants);
                    const stacks = evaluateExpression(effectDefinition[status].stacks, {
                        rank: event.source.character.traits[traitId]
                    });
                    targets.forEach(target => {
                        const existingStatus = (target.statuses[status] || [])
                            .find(s => {
                                return s.source.character === event.source.character.id &&
                                    s.source.trait === traitId
                            });
                        if (existingStatus) {
                            target.statuses[status] = target.statuses[status].filter(s => s != existingStatus);
                            event.roundEvents.push({
                                event: "remove-status",
                                source: {character: event.source.character.id},
                                target: target.id,
                                toRemove: existingStatus.uuid,
                                status,
                                stacks
                            });
                        }
                    })

                });
                break;
            case "reflect_damage":
                const targets = selectConditionTargets(effectDefinition.target, event.source.character, event.target, event.combatants);
                targets.forEach(target => {
                    const damageEffect = event.source.damage;
                    const dealtDamage = damageEffect.value;
                    const damageToDeal = evaluateExpression(effectDefinition.value, {
                        attackDamage: Decimal(dealtDamage),
                        rank: Decimal(event.source.character.traits[traitId])
                    }).floor();
                    target.hp = target.hp.minus(damageToDeal);
                    const newDamageEffectUuid = v4();
                    damageEffect.children = [
                        newDamageEffectUuid
                    ];
                    event.roundEvents.push(generateDamageEvent(
                        getCharacter(damageEffect.target),
                        target,
                        damageToDeal,
                        damageEffect.uuid,
                        newDamageEffectUuid
                    ));
                });
                break;
            case "gain_stamina": {
                const targets = selectConditionTargets(effectDefinition.target, event.source.character, event.target, event.combatants);
                targets.forEach(target => {
                    const staminaChange = evaluateExpression(effectDefinition.value, {
                        rank: Decimal(event.source.character.traits[traitId]),
                        player: event.source.character
                    }).floor();
                    target.combat.stamina = target.combat.stamina.plus(staminaChange);
                    const newDamageEffectUuid = v4();
                    event.roundEvents.push(generateStaminaChangeEvent(
                        event.source.character,
                        target,
                        staminaChange,
                        event.source.attack.uuid,
                        newDamageEffectUuid
                    ));
                });
            }
        }
    }
}