import * as _ from "lodash";

const config = {
    debug_enabled: process.env.REACT_APP_DEBUG_MODE === "true",
    action_log_max_size: process.env.REACT_APP_MAX_ACTIONLOG_SIZE || 20, // The maximum number of items in the history log.
    huntable_level: "playerLevel.minus(1)",
    lesser_level_scale: 1, // A demon is "lesser" than another when its level is this much lower.
    greater_level_scale: 1, // A demon is "greater" than another when its level is this much higher.
    intimidateable_demon_level: 10, // A demon can be intimidated when its level is this much lower than the player
    enemy_latent_power: "Decimal.max(0, encounterLevel.minus(1).times(5))", // The amount of latent power enemy demons start with
    bonus_points_for_highest_level: "highestLevelReached.plus(highestLevelReached.div(10).floor())", // How many bonus points the player gets, based on their highest level reached.
    latent_power_cap: "highestLevelEnemyDefeated.plus(1).times(10)", // The maximum the player's latent power cap can be.
    lesser_demon_instant_kill_level: "highestLevelReached.minus(10)",
    latent_power_per_level: 1,
    latent_power_effect_scale: .01,
    trait_point_cost: "Decimal.max(1, traitsOwned.times(2))",
    minimum_attribute_score: 1,
    // Combat
    base_attack_upgrade_cost: 0,
    base_attack_downgrade_cost: 0,
    attack_upgrade_cost_per_enemy_level: 100, // Add this amount times enemy level to upgrade your attacks
    attack_downgrade_cost_per_enemy_level: 100, // Add this amount times enemy level to downgrade enemy attacks
    flee_stamina_cost_base: 25,
    flee_stamina_minimum_cost: 1,
    instant_death_offset: 5,
    recovery_action_healing_percentage: .5,
    recover_action_stamina_percentage: 1,
    minimum_stamina: 0,
    bonus_stamina_per_level: 500,
    intimidation_cost_attribute: "cunning",
    trait_tier_up_levels: 25, // Traits upgrade when reaching a multiple of this level.
    minimum_attack_upgrade_cost: 10,
    minimum_attack_downgrade_cost: 10,
    maximum_upgrade_times: 2,
    maximum_downgrade_times: 1,
    fatigue_penalty_per_point: 25,
    stamina_recovery_per_level: 50,
    base_power_generated_per_level_per_tick: 50,
    power_generation_growth_scaling: .01,
    game_level_cap: 51,
    good_reputation_cap: 15,
    good_reputation_threshold: 10,
    bad_reputation_threshold: -10,
    bad_reputation_floor: 15,
    health_per_level: 25,
    damage_per_level: 5,
    health_modifier_attribute: "madness",
    attribute_health_modifier_scale: .1,
    attribute_score_minimum: 1,
    attribute_difference_multipliers: {
        "-5": 0.2,
        "-4": .33,
        "-3": .5,
        "-2": .75,
        "-1": .8,
        0: 1,
        1: 1.25,
        2: 1.5,
        3: 2,
        4: 3,
        5: 5
    },

    // Combat
    action_cost_per_enemy_level: 100,

    // Combat Attributes
    precision_base_attribute: "deceit", // The attribute used to calculate precision
    resilience_base_attribute: "madness",
    evasion_base_attribute: "cunning",
    power_base_attribute: "brutality",

    // Combat attribute effects
    evasion_effect_per_point: 0.05,
    precision_effect_per_point: 0.05,

    energy_cost_per_enemy_level: 100, // Enemy level times this amount is the base action cost.

    artifacts_enabled: false,

    // Negotiation
    negotiation_enabled: false,

    debug: process.env.REACT_APP_DEBUG_MODE === "true"
}

export function getConfigurationValue(path, defaultValue) {
    const configValue = _.get(config, path);
    if (configValue === undefined && defaultValue === undefined) {
        throw new Error(`No configuration value for ${path} found and no default found`);
    }
    return configValue;
}