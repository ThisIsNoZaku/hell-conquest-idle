import {debugMessage} from "../../../debugging";
import evaluateExpression from "../../general/evaluateExpression";
import Decimal from "decimal.js";
import {v4} from "node-uuid";
import selectConditionTargets from "./selectConditionTargets";
import * as _ from "lodash";
import {generateDamageEvent} from "../../events/generate";
import {getCharacter} from "../../index";

export default function applyTraitEffects(effectsToApply, event, traitId) {
    for (const effect of Object.keys(effectsToApply)) {
        debugMessage(`Applying trait effect ${effect}`);
        const effectDefinition = effectsToApply[effect];
        switch (effect) {
            case "add_statuses":
                Object.keys(effectDefinition).forEach(status => {
                    const targets = selectConditionTargets(effectDefinition[status].target, event.source, event.target, event.combatants);
                    const stacks = evaluateExpression(effectDefinition[status].stacks, {
                        rank: Decimal(event.source.traits[traitId])
                    });
                    const max = evaluateExpression(effectDefinition[status].max, {
                        rank: Decimal(event.source.traits[traitId])
                    });
                    const duration = evaluateExpression(effectDefinition[status].duration, {});
                    targets.forEach(target => {
                        const statusUuid = v4();
                        const existingStatus = (target.statuses[status] || [])
                            .find(s => {
                                return s.source.character === event.source.id &&
                                    s.source.trait === traitId;
                            });
                        if(existingStatus) {
                            existingStatus.duration = duration;
                            existingStatus.stacks = effectDefinition[status].cumulative ?
                                Decimal.min(existingStatus.stacks.plus(stacks), max) :
                                stacks;
                        } else {
                            target.statuses[status] = (target.statuses[status] || []);
                            target.statuses[status].push({
                                uuid: statusUuid,
                                source: {
                                    character: event.source.id,
                                    trait: traitId
                                },
                                duration,
                                stacks
                            });
                        }
                        if(duration < 999) {
                            event.roundEvents.push({
                                uuid: statusUuid,
                                event: "add-status",
                                source: {
                                    character: event.source.id,
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
                    const targets = selectConditionTargets(effectDefinition[status].target, event.source, event.combatants);
                    const stacks = evaluateExpression(effectDefinition[status].stacks, {
                        rank: event.source.traits[traitId]
                    });
                    targets.forEach(target => {
                        const existingStatus = (target.statuses[status] || [])
                            .find(s => {
                                return s.source.character === event.source.id &&
                                    s.source.trait === traitId
                            });
                        if (existingStatus) {
                            target.statuses[status] = target.statuses[status].filter(s => s != existingStatus);
                            event.roundEvents.push({
                                event: "remove-status",
                                source: event.source.id,
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
                const targets = selectConditionTargets(effectDefinition.target, event.source, event.target, event.combatants);
                targets.forEach(target => {
                    const damageEffect = event.roundEvents.find(ef => {
                        return ef.event === "damage" &&
                            ef.source.character === event.target.id &&
                            ef.target === event.source.id;
                    });
                    const dealtDamage = damageEffect.value;
                    const damageToDeal = evaluateExpression(effectDefinition.value, {
                        attackDamage: Decimal(dealtDamage),
                        rank: Decimal(event.source.traits[traitId])
                    }).floor();
                    target.hp = target.hp.minus(damageToDeal);
                    const newDamageEffectUuid = v4();
                    damageEffect.children = [
                        newDamageEffectUuid
                    ];
                    event.roundEvents.push(generateDamageEvent(
                        getCharacter(damageEffect.source.character),
                        getCharacter(damageEffect.target),
                        damageToDeal,
                        damageEffect.uuid,
                        newDamageEffectUuid
                        ));
                });
        }
    }
}