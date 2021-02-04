import {debugMessage} from "../../../debugging";
import evaluateExpression from "../../general/evaluateExpression";
import Decimal from "decimal.js";
import {v4} from "node-uuid";
import selectConditionTargets from "./selectConditionTargets";
import * as _ from "lodash";
import {generateDamageEvent, generateHealthChangeEvent, generateStaminaChangeEvent} from "../../events/generate";
import {getConfigurationValue} from "../../../config";
import {Traits} from "../../../data/Traits";
import {getCharacter} from "../../index";

export default function applyTraitEffects(effectsToApply, contextCharacter, event, sourceType, sourceId, effectLevel) {
    for (const effect of Object.keys(effectsToApply)) {
        debugMessage(`Applying trait effect ${effect}`);
        const effectDefinition = effectsToApply[effect];
        switch (effect) {
            case "add_statuses":
                // TODO: Refactor into method.
                Object.keys(effectDefinition).forEach(status => {
                    const targets = selectConditionTargets(effectDefinition[status].target, contextCharacter, event.target, event.combatants);
                    const stacks = effectDefinition[status].stacks ? Decimal(effectDefinition[status].stacks).times(effectLevel) :
                        Decimal(effectDefinition[status].stacks_per_level).times(effectLevel).times(event.source.character.powerLevel);
                    const max = effectDefinition[status].max || 999;
                    const duration = effectDefinition[status].duration || 1;
                    targets.forEach(target => {
                        const statusUuid = v4();
                        const existingStatus = (target.statuses[status] || [])
                            .find(s => {
                                return s.source.character === event.source.character.id &&
                                    s.source[sourceType] === sourceId;
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
                                    [sourceType]: sourceId
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
                                [sourceType]: sourceId
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
                        tier: effectLevel
                    });
                    targets.forEach(target => {
                        const existingStatus = (target.statuses[status] || [])
                            .find(s => {
                                return s.source.character === event.source.character.id &&
                                    s.source[sourceType] === sourceId
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
                const targets = [getCharacter(event.source.attack.source.character)];
                targets.forEach(target => {
                    const damageEffect = event.source.damage;
                    const dealtDamage = damageEffect.value;
                    const damageToDeal = Decimal(effectDefinition.value).times(dealtDamage).times(effectLevel).floor();
                    target.dealDamage(damageToDeal);
                    const newDamageEffectUuid = v4();
                    damageEffect.children = [
                        newDamageEffectUuid
                    ];
                    event.roundEvents.push(generateDamageEvent(
                        contextCharacter,
                        target,
                        damageToDeal,
                        effectDefinition.type,
                        sourceType,
                        sourceId
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
                        sourceType,
                        sourceId,
                        newEffectUuid,
                    ));
                });
            }
                break;
            case "change_health": {
                const targets = selectConditionTargets(effectDefinition.target, event.source.character, event.target, event.combatants);
                targets.forEach(target => {
                    const healthChange = effectDefinition.percentage_of_maximum_health ?
                        event.source.character.maximumHp.times(effectDefinition.percentage_of_maximum_health).times(effectLevel).floor() :
                        Decimal(effectDefinition.value).times(effectLevel).floor();
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
                        sourceType,
                        sourceId
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
            case "reflect_statuses": {
                const {target} = event;
                const originallyAppliedStacks = event.stacks;
                const duration = event.duration;
                const base = sourceType === "trait" ? Decimal(Traits[sourceId][event.type]["trigger_effects"][effect].value) : Decimal(1);
                const stacksToApply = originallyAppliedStacks.times(effectLevel)
                    .times(base)
                    .floor();
                event.roundEvents.push({
                    uuid: v4(),
                    event: "add-status",
                    source: {
                        character: contextCharacter.id,
                        [sourceType]: sourceId
                    },
                    target: event.source.character.id,
                    duration,
                    status: event.status,
                    stacks: stacksToApply
                });
                break;
            }
            default:
                debugMessage(`Did not process effect ${effect}`);
                if(getConfigurationValue("debug_enabled")) {
                    throw new Error(effect);
                }
        }
    }
}