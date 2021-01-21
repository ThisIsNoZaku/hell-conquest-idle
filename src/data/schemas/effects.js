import * as JOI from "joi";

export const effectTarget = JOI.valid("self", "source_character", "target_character", "all_enemies");

const effectModifier = JOI.object({
    target: effectTarget,
    modifier: [JOI.number(), JOI.string()]
});

export const modifierEffects = JOI.object({
    steal_item: JOI.object({
        target: effectTarget
    }),
    reflect_damage: JOI.object({
        target: effectTarget,
        value: [JOI.string(), JOI.number()]
    }),
    damage_modifier: JOI.object({
        target: JOI.valid("received", "dealt"),
        modifier: [JOI.number(), JOI.string()]
    }),
    devastating_hit_damage_multiplier: JOI.object({
        target: JOI.valid("received", "dealt"),
        modifier: [JOI.number(), JOI.string()]
    }),
    power_modifier: effectModifier,
    precision_modifier: effectModifier,
    evasion_modifier: effectModifier,
    stamina_modifier: effectModifier,
    attack_downgrade_cost_multiplier: effectModifier,
    attack_upgrade_cost_multiplier: effectModifier,
    maximum_hp_multiplier: effectModifier,
    power_gain_modifier: [JOI.string(), JOI.number()]
});