import * as _ from "lodash";

const config = {
    debug_enabled: process.env.REACT_APP_DEBUG_MODE === "true",
    action_log_max_size: process.env.REACT_APP_MAX_ACTIONLOG_SIZE || 20, // The maximum number of items in the history log.
    huntable_level: "playerLevel.minus(1)",
    lesser_level_scale: 1, // A demon is "lesser" than another when its level is this much lower.
    greater_level_scale: 1, // A demon is "greater" than another when its level is this much higher.
    intimidateable_demon_level: 10, // A demon can be intimidated when its level is this much lower than the player
    enemy_latent_power: "Decimal.max(0, encounterLevel.minus(1).times(25))", // The amount of latent power enemy demons start with
    bonus_points_for_highest_level : "highestLevelReached.plus(highestLevelReached.div(10).floor())", // How many bonus points the player gets, based on their highest level reached.
    latent_power_cap: "highestLevelEnemyDefeated.times(25)", // The maximum the player's latent power cap can be.
    lesser_demon_instant_kill_level: "highestLevelReached.minus(10)",
    latent_power_gain_on_reincarnate:  "player.powerLevel.times(5)",
    latent_power_effect_scale: .01,
    trait_point_cost: "Decimal.max(1, traitsOwned.times(2))",
    base_attack_upgrade_cost: 100,
    base_attack_downgrade_cost: 100,
    minimum_attribute_score: 1,
    damage_per_level: 10,
    flee_stamina_cost_base: 5,
    flee_stamina_minimum_cost: 1,
    instant_death_offset: 5,
    recovery_action_healing_percentage: .5,
    recover_action_stamina: 1,
    mechanics: {
        reincarnation: {
            latentPowerModifier: "Decimal.min(latentPower, highestLevelReached).plus(latentPower.minus(Decimal.min(latentPower, highestLevelReached).sqrt())",
            traitPointCost: "Decimal.max(1, traitsOwned.times(2))",
            attributePointCost: "Decimal.max(1, attributeScore)"
        },
        xp: {
            gainedFromGreaterDemon: "enemy.powerLevel.pow(2).times(5)",
            gainedFromLesserDemon: "Decimal.sqre(enemy.powerLevel).ceil()",
            gainedFromOtherDemon: "enemy.powerLevel.times(5)"
        },
        levelToPowerEquation: "level.eq(1) ? 0 : Decimal.floor(Decimal(5).pow(level.minus(1)))",
        powerToLevelEquation: "Decimal(powerPoints).eq(0) ? 1 : Decimal.floor(Decimal.log(powerPoints, 5)).plus(1)",
        maxLevel: 25,
        combat: {
            startingHitLevel: 0,
            fatigueDamageMultiplier: 0.1,
            attackUpgradeBaseCost: 100,
            incomingAttackDowngradeBaseCost: 100,
            stolenPowerScale: 0.25,
            randomEncounterChance: "player.powerLevel.div(10).floor().times(10)",
            determineHit: "roll >= target ? 'hit' : 'miss'",
            precision: { // Determines how precision rolls work
                baseAttribute: "deceit",
                effectPerPoint: 200
            },
            attributeDifferenceMultipliers: {
                "-10" : 0.001,
                "-9" : 0.01,
                "-8" : 0.025,
                "-7": 0.05,
                "-6": 0.075,
                "-5": 0.1,
                "-4" : .25,
                "-3" : .5,
                "-2" : .75,
                "-1" : .9,
                0: 1,
                1: 1.1,
                2: 1.25,
                3: 1.5,
                4: 1.75,
                5: 2,
                6: 2.25,
                7: 2.50,
                8: 2.75,
                9: 4,
                10: 5
            },
            effectiveAttributeCalculation: "Decimal.floor(baseAttribute.times(stolenPowerModifier))",
            resilience: {
                baseAttribute: "madness",
                effectPerPoint: .05
            },
            evasion: {
                baseAttribute: "cunning",
                effectPerPoint: 200
            },
            power: {
                baseAttribute: "brutality",
                effectPerPoint: .05
            },
            traitRank: {
                baseAttribute: "madness",
                effectPerPoint: .01
            },
            playerAttributeMinimum: 1,
            fatigue: {
                evasionPenaltyPerPoint: 2
            },
            hp: {
                pcBonus: 25,
                baseHp: 10,
                pointsPerLevel: 15,
                healingPerLevel: 5,
                baseAttribute: "brutality",
                effectPerPoint: .1
            },
            baseHitChance: 90,
            baseDamage: "player.powerLevel.times(10)",
            defaultMinDamageMultiplier: .8,
            defaultMedDamageMultiplier: 1,
            defaultMaxDamageMultiplier: 1.2,
            baseMinimumDamageWeight: 5,
            baseMedianDamageWeight: 90,
            baseMaximumDamageWeight: 5
        }
    },
    // Artifacts
    artifacts_enabled: false,

    // Negotiation
    negotiation_enabled: false,

    debug: process.env.REACT_APP_DEBUG_MODE === "true"
}

export function getConfigurationValue(path, defaultValue) {
    const configValue = _.get(config, path);
    if(configValue === undefined && defaultValue === undefined) {
        throw new Error(`No configuration value for ${path} found and no default found`);
    }
    return configValue;
}