import {debugMessage} from "../../debugging";
import {Traits} from "../../data/Traits";
import * as JOI from "joi";
import doesTraitTrigger from "../combat/events/doesTraitTrigger";
import applyTraitEffects from "../combat/events/applyTraitEffects";
import selectConditionTargets from "../combat/events/selectConditionTargets";
import {Statuses} from "../../data/Statuses";
import {generateDamageEvent} from "../events/generate";
import {Decimal} from "decimal.js";
import {getCharacter} from "../index";

export default function triggerEvent(event) {
    const eventValidation = eventMatcher.validate(event);
    if (eventValidation.error) {
        throw new Error(`Invalid event shape: ${eventValidation.error}`);
    }
    // Trigger traits for event
    debugMessage(`Triggering event ${event.type}`);
    Object.keys(event.source.character.traits).forEach(traitId => {
        const trait = Traits[traitId];
        const eventDefinition = trait[event.type];
        if (eventDefinition) {
            const traitTriggered = doesTraitTrigger(eventDefinition, event);
            debugMessage(`Trait ${traitId} did ${traitTriggered ? '' : 'not'} trigger.`);
            const effectsToApply = eventDefinition[traitTriggered ? "trigger_effects" : "not_trigger_effects"];
            if (effectsToApply) {
                applyTraitEffects(effectsToApply, event, traitId);
            }
        }
    });
    Object.keys(event.source.character.statuses).forEach(statusId => {
        const status = Statuses[statusId];
        Object.keys(status.effects).forEach(effect => {
            switch (effect) {
                case "inflict_damage_at_start_of_round":
                    if(event.type !== "on_round_begin") {
                        return;
                    }
                    const targets = selectConditionTargets(status.effects[effect].target, event.source.character, event.target, event.combatants);
                    targets.forEach(target => {
                        const activeStatus = target.getActiveStatusInstance(statusId);
                        const damageToDeal = Decimal(status.effects[effect].value)
                            .times(target.getStatusStacks(statusId))
                            .times(getCharacter(activeStatus.source.character).powerLevel);
                        target.hp = Decimal.max(0, target.hp.minus(damageToDeal));
                        event.roundEvents.push(generateDamageEvent(activeStatus, target, damageToDeal))
                    })
                    break;
            }
        })
    })
}

const eventMatcher = JOI.object({
    type: JOI.valid("on_kill", "on_taking_damage", "on_round_begin", "on_round_end", "on_miss_hit", "on_hit", "on_minor_hit", "on_glancing_hit", "on_solid_hit", "on_serious_hit", "on_devastating_hit", "on_combat_start").required(),
    combatants: JOI.object().required(),
    roundEvents: JOI.array().required(),
    source: JOI.object(),
    target: JOI.object()
});