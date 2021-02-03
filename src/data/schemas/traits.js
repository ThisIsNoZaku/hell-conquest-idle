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
    chance: [JOI.number().min(0).max(100), JOI.string()],
    source_character_is: JOI.object({
        target: effectTarget
    }),
    target_character_is: JOI.object({
        target: effectTarget
    })
});

// Effects
const eventEffects = modifierEffects.keys({
    add_statuses: JOI.object().keys(statusNames.reduce((schemas, nextStatus) => {
        schemas[nextStatus] = JOI.object({
            target: effectTarget,
            stacks: [JOI.string(), JOI.number().min(1)],
            stacks_per_level: JOI.number().min(1),
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
    reflect_statuses: JOI.object({
        target: effectTarget,
        value: JOI.number(),
    }),
    change_stamina: JOI.object({
        target: effectTarget,
        percentage_of_maximum_stamina: [JOI.string(), JOI.number()]
    }),
    change_health: JOI.object({
        target: effectTarget,
        percentage_of_maximum_health: [JOI.string(), JOI.number()],
        value: [JOI.string(), JOI.number()]
    }),
    trait_mirror: JOI.object({
        target: effectTarget,
        value: JOI.number()
    })
});

// Validators
const onEventValidator = JOI.object({
    conditions: eventConditions,
    trigger_effects: eventEffects,
    not_trigger_effects: eventEffects
});

const onIntimidateValidator = onEventValidator;

const onAttackHitValidator = onIntimidateValidator

const onKillValidator = onAttackHitValidator;

const continuousValidator = JOI.object({
    trigger_effects: modifierEffects,
    not_trigger_effects: modifierEffects
});

const onTakingDamageValidator = onAttackHitValidator;

const onCombatStartValidator = onEventValidator;

const traitValidator = JOI.object({
    name: JOI.string().required(),
    icon: JOI.string().required(),
    enabled: JOI.boolean(),
    attack_enhancement: JOI.string(),
    defense_enhancement: JOI.string(),
    description: JOI.function(),
    on_round_end: onEventValidator,
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
    on_combat_start: onCombatStartValidator,
    on_status_applied: onEventValidator
}).unknown(false);

export function validatedTrait(object) {
    const validationResult = traitValidator.validate(object);
    if (validationResult.error) {
        throw new Error(validationResult.error.details.map(d => d.message).join(", "));
    }
    return validationResult.value;
}