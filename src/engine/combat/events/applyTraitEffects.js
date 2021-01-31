import {debugMessage} from "../../../debugging";
import evaluateExpression from "../../general/evaluateExpression";
import Decimal from "decimal.js";
import {v4} from "node-uuid";
import selectConditionTargets from "./selectConditionTargets";
import * as _ from "lodash";
import {generateDamageEvent, generateHealthChangeEvent, generateStaminaChangeEvent} from "../../events/generate";

export default function applyTraitEffects(effectsToApply, event, traitId) {
    for (const effect of Object.keys(effectsToApply)) {
        debugMessage(`Applying trait effect ${effect}`);
        const effectDefinition = effectsToApply[effect];
        switch (effect) {
            case "add_statuses":
                // TODO: Refactor into method.
                Object.keys(effectDefinition).forEach(status => {
                    const targets = selectConditionTargets(effectDefinition[status].target, event.source.character, event.target, event.combatants);
                    const stacks = effectDefinition[status].stacks ? Decimal(effectDefinition[status].stacks).times(event.source.character.traits[traitId]) :
                        Decimal(effectDefinition[status].stacks_per_level).times(event.source.character.traits[traitId]).times(event.source.character.powerLevel);
                    const max = evaluateExpression(effectDefinition[status].max, {
                        tier: Decimal(event.source.character.traits[traitId])
                    });
                    const duration = effectDefinition[status].duration || 1;
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
                                Decimal.min(Decimal(existingStatus.stacks).plus(stacks), max) :
                                stacks;
                        } else {
                            target.statuses[status] = (target.statuses[status] || []);
                            target.statuses[status].push({
                                uuid: statusUuid,
                                status,
                                source: {
                                    character: event.source.character.id,
                                    trait: traitId
                                },
                                duration,
                                stacks
                            });
                        }
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
                    })

                });
                break;
            case "remove_statuses":
                Object.keys(effectDefinition).forEach(status => {
                    const targets = selectConditionTargets(effectDefinition[status].target, event.source.character, event.combatants);
                    const stacks = evaluateExpression(effectDefinition[status].stacks, {
                        tier: event.source.character.traits[traitId]
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
                    const damageToDeal = Decimal(effectDefinition.value).times(dealtDamage).times(event.source.character.traits[traitId]).floor();
                    target.hp = target.hp.minus(damageToDeal);
                    const newDamageEffectUuid = v4();
                    damageEffect.children = [
                        newDamageEffectUuid
                    ];
                    event.roundEvents.push(generateDamageEvent(
                        event.source.character,
                        target,
                        damageToDeal,
                        effectDefinition.type,
                        traitId
                    ));
                });
                break;
            case "change_stamina": {
                const targets = selectConditionTargets(effectDefinition.target, event.source.character, event.target, event.combatants);
                targets.forEach(target => {
                    const staminaChange = event.source.character.combat.maximumStamina.times(effectDefinition.percentage_of_maximum_stamina).floor();
                    target.combat.stamina = target.combat.stamina.plus(staminaChange);
                    const newEffectUuid = v4();
                    if (event.source.attack) {
                        event.source.attack.children.push(newEffectUuid);
                    }
                    event.roundEvents.push(generateStaminaChangeEvent(
                        event.source.character,
                        target,
                        staminaChange,
                        _.get(event.source, ["attack", "uuid"]),
                        traitId,
                        newEffectUuid,
                    ));
                });
            }
                break;
            case "change_health": {
                const targets = selectConditionTargets(effectDefinition.target, event.source.character, event.target, event.combatants);
                targets.forEach(target => {
                    const healthChange = effectDefinition.percentage_of_maximum_health ?
                        event.source.character.maximumHp.times(effectDefinition.percentage_of_maximum_health).times(event.source.character.traits[traitId]).floor() :
                        Decimal(effectDefinition.value).times(event.source.character.traits[traitId]).floor();
                    target.hp = target.hp.plus(healthChange);
                    const newEffectUuid = v4();
                    if (event.source.attack) {
                        event.source.attack.children.push(newEffectUuid);
                    }
                    event.roundEvents.push(generateHealthChangeEvent(
                        event.source.character,
                        target,
                        healthChange,
                        _.get(event.source, ["attack", "uuid"]),
                        newEffectUuid,
                        traitId
                    ));
                });
            }
                break;
            case "trait_mirror":
                const {target} = event;
                Object.keys(target.traits).forEach(trait => {
                    const actor = event.source.character;
                    actor.temporaryTraits = {...target.traits};
                })
                break;
            default:
                debugMessage(`Did not process effect ${effect}`);
        }
    }
}