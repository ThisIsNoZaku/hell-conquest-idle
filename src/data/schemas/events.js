import * as JOI from "joi";
import {effectTarget, modifierEffects} from "./effects";
import {Statuses} from "../Statuses";

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
        percentage_of_maximum_stamina: [JOI.string(), JOI.number()],
        percentage_of_current_stamina: JOI.number()
    }),
    change_health: JOI.object({
        target: effectTarget,
        percentage_of_maximum_health: [JOI.string(), JOI.number()],
        value: [JOI.string(), JOI.number()],
        percentage_of_current_stamina: JOI.number()
    }),
    change_fatigue: JOI.object({
        target: effectTarget,
        percentage_of_maximum_stamina: [JOI.string(), JOI.number()],
        percentage_of_current_stamina: JOI.number(),
        value: [JOI.string(), JOI.number()]
    }),
    trait_mirror: JOI.object({
        target: effectTarget,
        value: JOI.number()
    })
});

// Validators
export const onEventValidator = JOI.object({
    conditions: eventConditions,
    trigger_effects: eventEffects,
    not_trigger_effects: eventEffects
});

export const eventsValidator = JOI.object({
    on_round_end: onEventValidator,
    on_hit: onEventValidator,
    on_intimidate: onEventValidator,
    on_solid_hit: onEventValidator,
    on_serious_hit: onEventValidator,
    on_devastating_hit: onEventValidator,
    on_glancing_hit: onEventValidator,
    on_minor_hit: onEventValidator,
    on_critical_hit: onEventValidator,
    on_kill: onEventValidator,
    on_taking_damage: onEventValidator,
    on_combat_start: onEventValidator,
    on_status_applied: onEventValidator,
    on_dodge: onEventValidator
});
