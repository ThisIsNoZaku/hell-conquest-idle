import * as JOI from "joi";
import {Statuses} from "../Statuses";
import {effectTarget, modifierEffects} from "./effects";
import {Traits} from "../Traits";

const conditionTriggerTarget = JOI.valid("any_enemy");

const statusNames = Object.keys(Statuses);
// Conditions
const eventConditions = JOI.object({
    health_percentage: JOI.object({
        target: conditionTriggerTarget,
        below: [JOI.number().min(0).max(100), JOI.string()]
    }),
    chance: [JOI.number().min(0).max(100), JOI.string()]
});

// Effects
const eventEffects = modifierEffects.keys({
    add_statuses: JOI.object().keys(statusNames.reduce((schemas, nextStatus) => {
        schemas[nextStatus] = JOI.object({
            target: effectTarget,
            stacks: [JOI.string(), JOI.number().min(0)],
            duration: JOI.number().min(-1).default(1),
            max: [JOI.number().min(1), JOI.string()],
            cumulative: JOI.boolean()
        });
        return schemas;
    }, {})),
    remove_statuses: JOI.object().keys(statusNames.reduce((schemas, nextStatus) => {
        schemas[nextStatus] = JOI.object({
            target: effectTarget,
            sourceTrait: JOI.string(),
            stacks: [JOI.string(), JOI.number().min(0)]
        });
        return schemas;
    }, {})),
    change_stamina: JOI.object({
        target: effectTarget,
        percentage_of_maximum_stamina: [JOI.string(), JOI.number()]
    })
});

// Validators
const onRoundEndValidator = JOI.object({
    conditions: eventConditions,
    trigger_effects: eventEffects,
    not_trigger_effects: eventEffects
});

const onIntimidateValidator = onRoundEndValidator;

const onAttackHitValidator = onIntimidateValidator

const onKillValidator = onAttackHitValidator;

const continuousValidator = JOI.object({
    trigger_effects: modifierEffects,
    not_trigger_effects: modifierEffects
});

const onTakingDamageValidator = onAttackHitValidator;

const onCombatStartValidator = onRoundEndValidator;

const traitValidator = JOI.object({
    name: JOI.string().required(),
    icon: JOI.string().required(),
    description: JOI.function(),
    on_round_end: onRoundEndValidator,
    on_hit: onAttackHitValidator,
    on_intimidate: onIntimidateValidator,
    on_solid_hit: onAttackHitValidator,
    on_serious_hit: onAttackHitValidator,
    on_devastating_hit: onAttackHitValidator,
    on_glancing_hit: onAttackHitValidator,
    on_minor_hit: onAttackHitValidator,
    on_critical_hit: onAttackHitValidator,
    on_kill: onKillValidator,
    continuous: continuousValidator,
    on_taking_damage: onTakingDamageValidator,
    on_combat_start: onCombatStartValidator
}).unknown(false);

export function validatedTrait(object) {
    const validationResult = traitValidator.validate(object);
    if (validationResult.error) {
        throw new Error(validationResult.error.details.map(d => d.message).join(", "));
    }
    return validationResult.value;
}