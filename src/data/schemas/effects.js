import * as JOI from "joi";

export const effectTarget = JOI.valid("self", "enemy", "all");

const effectModifier = JOI.object({
    target: effectTarget,
    value: [JOI.number(), JOI.string()]
});

export const modifierEffects = JOI.object({
    steal_item: JOI.object({
        target: effectTarget
    }),
    reflect_damage: {
        target: effectTarget,
        value: JOI.number(),
        type: JOI.string()
    },
    damage_modifier: effectModifier,
    devastating_hit_damage_multiplier: effectModifier,
    power_modifier: effectModifier,
    resilience_modifier: effectModifier,
    precision_modifier: effectModifier,
    evasion_modifier: effectModifier,
    maximum_stamina_modifier: effectModifier,
    energy_generation_modifier: effectModifier,
    attack_downgrade_cost_multiplier: effectModifier,
    attack_upgrade_cost_multiplier: effectModifier,
    maximum_health_modifier: effectModifier,
    power_gain_modifier: effectModifier,
    damage_resistance: {
        target: effectTarget,
        type: JOI.string(),
        percentage: [JOI.string(), JOI.number()]
    },
    inflict_damage_at_start_of_round: {
        target: effectTarget,
        damageType: JOI.string(),
        value: JOI.number()
    },
    block_cost_modifier: effectModifier
});