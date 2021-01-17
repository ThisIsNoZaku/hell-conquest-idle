import {debugMessage} from "../../debugging";
import {Traits} from "../../data/Traits";
import * as JOI from "joi";
import evaluateExpression from "./evaluateExpression";
import Decimal from "decimal.js";
import { v4 } from "node-uuid";

export default function triggerEvent(event) {
    const eventValidation = eventMatcher.validate(event);
    if (eventValidation.error) {
        throw new Error(`Invalid event shape: ${eventValidation.error}`);
    }
    // Trigger traits for event
    debugMessage(`Triggering event ${event.type}`);
    switch (event.type) {
        case "on_round_begin":
        case "on_round_end":
        case "on_hit":
        case "on_serious_hit":
        case "on_devastating_hit":
        case "on_solid_hit":
        case "on_minor_hit":
        case "on_glancing_hit":
        case "on_miss_hit":
            Object.keys(event.source.traits).forEach(traitId => {
                const trait = Traits[traitId];
                const eventDefinition = trait[event.type];
                if (eventDefinition) {
                    const traitTriggered = doesTraitTrigger(eventDefinition, event);
                    debugMessage(`Trait ${traitId} did ${traitTriggered ? '' : 'not' } trigger.`);
                    const effectsToApply = eventDefinition[traitTriggered ? "trigger_effects" : "not_trigger_effects"];
                    if (effectsToApply) {
                        applyTraitEffects(effectsToApply, event, traitId);
                    }
                }
            });
    }

}

const eventMatcher = JOI.object({
    type: JOI.valid("on_round_begin", "on_round_end", "on_miss_hit", "on_hit", "on_minor_hit", "on_glancing_hit", "on_solid_hit", "on_serious_hit", "on_devastating_hit").required(),
    combatants: JOI.object().required(),
    roundEvents: JOI.array().required(),
    source: JOI.object(),
    target: JOI.object()
});

function selectConditionTargets(targetType, sourceCharacter, targetCharacter, combatants) {
    switch (targetType) {
        case "any_enemy":
        case "all_enemy":
            return Object.values(combatants).filter(c => c.party !== sourceCharacter.party);
        case "source_character":
            return [sourceCharacter];
        case "target_character":
            return [targetCharacter];
        default:
            throw new Error();
    }
}

function applyTraitEffects(effectsToApply, event, traitId) {
    for (const effect of Object.keys(effectsToApply)) {
        debugMessage(`Applying trait effect ${effect}`);
        const effectDefinition = effectsToApply[effect];
        switch (effect) {
            case "add_statuses":
                Object.keys(effectDefinition).forEach(status => {
                    const targets = selectConditionTargets(effectDefinition[status].target, event.source, event.target, event.combatants);
                    const stacks = evaluateExpression(effectDefinition[status].rank, {
                        rank: Decimal(event.source.traits[traitId])
                    });
                    const duration = evaluateExpression(effectDefinition[status].duration, {});
                    targets.forEach(target => {
                        const statusUuid = v4();
                        const existingStatus = (target.statuses[status] || [])
                            .find(s => s.source === event.source.id);
                        if(existingStatus) {
                            existingStatus.duration = duration;
                            existingStatus.stacks = stacks;
                        } else {
                            target.statuses[status] = (target.statuses[status] || []);
                            target.statuses[status].push({
                                uuid: statusUuid,
                                source: event.source.id,
                                duration,
                                stacks
                            });
                        }
                        if(duration < 999) {
                            event.roundEvents.push({
                                uuid: statusUuid,
                                event: "add-status",
                                source: event.source.id,
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
                    const stacks = evaluateExpression(effectDefinition[status].rank, {
                        rank: event.source.traits[traitId]
                    });
                    targets.forEach(target => {
                        const existingStatus = (target.statuses[status] || [])
                            .find(s => s.source === event.source.id);
                        if (existingStatus) {
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
        }
    }
}

function doesTraitTrigger(eventDefinition, event) {
    return Object.keys(eventDefinition.conditions || {}).reduce((previousConditionsMet, nextCondition) => {
        let nextConditionMet = false;
        const conditionDefinition = eventDefinition.conditions[nextCondition]
        const targets = selectConditionTargets(conditionDefinition.target, event.source, event.target, event.combatants);
        switch (nextCondition) {
            case "health_percentage":
                switch (conditionDefinition.target) {
                    case "any_enemy":
                        nextConditionMet = targets.some(nextTarget => {
                            const healthPercentage = nextTarget.hp.div(nextTarget.maximumHp);
                            return healthPercentage.times(100).lte(conditionDefinition.below);
                        });
                        break;
                    case "all_enemy":
                        nextConditionMet = targets.every(nextTarget => {
                            const healthPercentage = nextTarget.hp.div(nextTarget.maximumHp);
                            return healthPercentage.lte(conditionDefinition[nextCondition].below);
                        });
                        break;
                }

                break;
        }
        return nextConditionMet && previousConditionsMet;
    }, true);
}