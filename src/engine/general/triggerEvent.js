import {debugMessage} from "../../debugging";
import {Traits} from "../../data/Traits";
import * as JOI from "joi";
import doesTraitTrigger from "../combat/events/doesTraitTrigger";
import applyTraitEffects from "../combat/events/applyTraitEffects";

export default function triggerEvent(event) {
    const eventValidation = eventMatcher.validate(event);
    if (eventValidation.error) {
        throw new Error(`Invalid event shape: ${eventValidation.error}`);
    }
    // Trigger traits for event
    debugMessage(`Triggering event ${event.type}`);
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

const eventMatcher = JOI.object({
    type: JOI.valid("on_kill", "on_round_begin", "on_round_end", "on_miss_hit", "on_hit", "on_minor_hit", "on_glancing_hit", "on_solid_hit", "on_serious_hit", "on_devastating_hit").required(),
    combatants: JOI.object().required(),
    roundEvents: JOI.array().required(),
    source: JOI.object(),
    target: JOI.object()
});