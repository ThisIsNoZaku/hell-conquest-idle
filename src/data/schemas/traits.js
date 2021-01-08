import * as JOI from "joi";
import { Statuses } from "../Statuses";

const conditionTriggerTarget = JOI.valid("any_enemy");
const effectTarget = JOI.valid("self", "acting_character", "target_character", "all_enemies");

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
const eventEffects = JOI.object({
    add_statuses: JOI.object().keys(statusNames.reduce((schemas, nextStatus) => {
        schemas[nextStatus] = JOI.object({
            target: effectTarget,
            rank: [JOI.string(), JOI.number().min(0)]
        });
        return schemas;
    }, {})),
    steal_item: JOI.object({
        target: effectTarget
    }),
    precision_modifier: JOI.object({
        target: effectTarget,
        modifier: [JOI.number(), JOI.string()]
    }),
    damage: JOI.object({
        target: effectTarget,
        value: [JOI.number(), JOI.string()]
    }),
    power_gain_modifier: [JOI.string(), JOI.number()]
});

// Validators
const onRoundEndValidator = JOI.object({
    conditions: eventConditions,
    effects: eventEffects
});

const onIntimidateValidator = JOI.object({
    conditions: eventConditions,
    effects: eventEffects
});

const onAttackHitValidator = onIntimidateValidator

const onKillValidator = onAttackHitValidator;

const continuousValidator = onRoundEndValidator;

const onTakingDamageValidator = onAttackHitValidator;

const onCombatStartValidator = onRoundEndValidator;

const traitValidator = JOI.object({
    name: JOI.string().required(),
    icon: JOI.string().required(),
    description: JOI.function(),
    on_round_end: onRoundEndValidator,
    on_intimidate: onIntimidateValidator,
    on_critical_hit: onAttackHitValidator,
    on_kill: onKillValidator,
    continuous: continuousValidator,
    on_taking_damage: onTakingDamageValidator,
    on_combat_start: onCombatStartValidator
}).unknown(false);

export function validatedTrait(object) {
    const validationResult = traitValidator.validate(object);
    if(validationResult.error) {
        throw new Error(validationResult.error.details.map(d => d.message).join(", "));
    }
    return validationResult.value;
}