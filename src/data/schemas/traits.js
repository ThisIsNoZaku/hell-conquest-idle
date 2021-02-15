import * as JOI from "joi";
import {Statuses} from "../Statuses";
import {effectTarget, modifierEffects} from "./effects";
import {Traits} from "../Traits";
import {eventsValidator} from "./events";

const continuousValidator = JOI.object({
    trigger_effects: modifierEffects,
    not_trigger_effects: modifierEffects
});

const traitValidator = eventsValidator.keys({
    name: JOI.string().required(),
    icon: JOI.string().default("./icons/icons-1.png"),
    enabled: JOI.boolean(),
    attack_enhancement: JOI.string(),
    defense_enhancement: JOI.string(),
    description: JOI.function(),
    continuous: continuousValidator,
}).unknown(false);

export function validatedTrait(object) {
    const validationResult = traitValidator.validate(object);
    if (validationResult.error) {
        throw new Error(validationResult.error.details.map(d => d.message).join(", "));
    }
    return validationResult.value;
}