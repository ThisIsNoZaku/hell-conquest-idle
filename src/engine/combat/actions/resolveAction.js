import determineCharacterCombatAction from "./determineCharacterCombatAction";
import {AttackActions} from "../../../data/CombatActions";
import resolveAttack from "../resolveAttack";
import determineCharacterCombatReaction from "./determineCharacterCombatReaction";
import triggerEvent from "../../general/triggerEvent";
import {HitTypes} from "../../../data/HitTypes";
import {generateActionSkipEvent} from "../../events/generate";
import selectConditionTargets from "../events/selectConditionTargets";
import Decimal from "decimal.js";
import {v4} from "node-uuid";
import {Traits} from "../../../data/Traits";
import * as _ from "lodash";

export default function resolveAction(actingCharacter, combatants, roundEvents, tick) {
    const actionChoices = determineCharacterCombatAction(actingCharacter, actingCharacter.combat.stamina, Object.values(combatants).find(x => x.id != actingCharacter.id));
    const actingCharacterAction = AttackActions[actionChoices.primary];
    if (actingCharacterAction.performsAction) {
        if (actingCharacterAction.attack) {
            // TODO: Move into new method
            const possibleTargets = Object.values(combatants).filter(c => c.id !== actingCharacter.id);
            const actionTarget = possibleTargets[0];
            const targetedCharacterReaction = determineCharacterCombatReaction(actingCharacter, actingCharacterAction, actionTarget, actionTarget.combat.stamina);
            const attackResult = resolveAttack(actingCharacter, actionChoices, actionTarget, targetedCharacterReaction, tick);
            roundEvents.push(attackResult.attack);
            if (attackResult.attack.hit) {
                roundEvents.push(attackResult.damage);
                triggerEvent({
                    type: "on_hit",
                    source: {
                        character: actingCharacter,
                        attack: attackResult.attack
                    },
                    target: actionTarget,
                    combatants,
                    roundEvents
                });
                triggerEvent({
                    type: `on_${HitTypes[attackResult.hitType].summary}_hit`,
                    source: {
                        character: actingCharacter,
                        attack: attackResult.attack
                    },
                    target: actionTarget,
                    combatants,
                    roundEvents
                });
                if (attackResult.damage) {
                    triggerEvent({
                        type: "on_taking_damage",
                        source: {
                            character: actionTarget,
                            attack: attackResult.attack,
                            damage: attackResult.damage
                        },
                        target: actingCharacter,
                        combatants,
                        roundEvents
                    });
                }
            } else {
                triggerEvent({
                    type: "on_miss",
                    source: {
                        character: actingCharacter
                    },
                    target: actionTarget,
                    combatants,
                    roundEvents
                });
            }
        } else {
            Object.keys(actingCharacterAction).forEach(key => {
                switch (key) {
                    case "add_statuses":
                        Object.keys(actingCharacterAction.add_statuses).forEach(status => {
                            const effectDefinition = actingCharacterAction.add_statuses[status];
                            const sourceTraitId  = Object.keys(actingCharacter.traits).reduce((currentTrait, trait)=>{
                                if(_.get(Traits, [trait, "special_actions"], []).includes(actionChoices)) {
                                    if(currentTrait === null || Decimal(actingCharacter.traits[trait]).gt(actingCharacter.traits[currentTrait])) {
                                        return trait;
                                    }
                                }
                                return currentTrait;
                            }, null);
                            const traitTier = actingCharacter.traits[sourceTraitId];
                            const targets = selectConditionTargets(effectDefinition.target, actingCharacter, Object.values(combatants).find(c => c.id !== actingCharacter.id), combatants);
                            const stacks = Decimal(effectDefinition.stacks).times(traitTier);
                            const max = traitTier.times(effectDefinition.max || 0);
                            const duration = effectDefinition.duration || 1;
                            targets.forEach(target => {
                                const statusUuid = v4();
                                const existingStatus = (target.statuses[status] || [])
                                    .find(s => {
                                        return s.source.character === actingCharacter.id &&
                                            s.source.trait === sourceTraitId;
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
                                            character: actingCharacter.id,
                                            trait: sourceTraitId
                                        },
                                        duration,
                                        stacks
                                    });
                                }
                                if (duration < 999) {
                                    roundEvents.push({
                                        uuid: statusUuid,
                                        event: "add-status",
                                        source: {
                                            character: actingCharacter.id,
                                            trait: sourceTraitId
                                        },
                                        target: target.id,
                                        duration,
                                        status,
                                        stacks
                                    });
                                }
                            });
                        });
                }
            });
        }
    } else {
        roundEvents.push(generateActionSkipEvent(actingCharacter, tick, "to save energy"));
    }
}