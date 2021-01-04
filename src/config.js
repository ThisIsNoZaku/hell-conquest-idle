import * as _ from "lodash";
console.log(process.env.REACT_APP_DEBUG_MODE, typeof process.env.REACT_APP_DEBUG_MODE);

export const config = {
    manualSpeedup: {
        enabled: false,
        multiplier: 2
    },

    actionLog: {
        maxSize:  process.env.REACT_APP_MAX_ACTIONLOG_SIZE || 20,
    },
    encounters: {
        lesserEncounterChanceWeight: 10,
        greaterEncounterChanceWeight: 10,
        evenEncounterChanceWeight: 80,
        lesserLevelScale: 1, // A demon is "lesser" than another when its level is this much lower.
        greaterLevelScale: 1, // A demon is "greater" than another when its level is this much higher.
        chanceToIntimidateLesser: "player.powerLevel.minus(enemy.powerLevel).pow(2).times(10)",
        chanceToEscapeGreater: "player.powerLevel.gt(enemy.powerLevel) ? 100 : Decimal.max(enemy.powerLevel.minus(player.powerLevel), 1).pow(2).times(10)"
    },

    mechanics: {
        artifacts: {
            enabled: process.env.REACT_APP_FEATURE_ARTIFACTS_ENABLED || false
        },
        reincarnation: {
            bonusPointsForHighestLevel: 2,
            latentPowerGainOnReincarnate: "player.powerLevel.pow(2)",
            latentPowerEffectScale: .01,
            traitPointCost: "Decimal.max(1, traitsOwned.times(2))"
        },
        xp: {
            gainedFromGreaterDemon: "enemy.powerLevel",
            gainedFromLesserDemon: "enemy.powerLevel",
            gainedFromOtherDemon: "enemy.powerLevel.times(5)"
        },
        levelToPowerEquation: "$level.eq(1) ? Decimal(0) : Decimal($level.minus(1).toNumber()).pow(2).times(5)",
        powerToLevelEquation: "Decimal(0).eq($powerPoints) ? Decimal(1) : Decimal.sqrt($powerPoints.div(5)).plus(1).floor()",
        maxLevel: 25,
        combat: {
            randomEncounterChance: "player.powerLevel.div(10).floor().times(10)",
            determineHit: "roll >= target ? 'hit' : 'miss'",
            precision: { // Determines how precision rolls work
                baseAttribute: "deceit",
                effectPerPoint: .1
            },
            resilience: {
                baseAttribute: "brutality",
                effectPerPoint: .1
            },
            evasion: {
                baseAttribute: "cunning",
                effectPerPoint: .1
            },
            power: {
                baseAttribute: "brutality",
                effectPerPoint: .1
            },
            traitRank: {
                baseAttribute: "madness",
                effectPerPoint: .05
            },
            fatigue: {
                evasionPenaltyPerPoint: 2
            },
            hp: {
                pcBonus: 10,
                pointsPerLevel: 25,
                healingPerLevel: 5,
                baseAttribute: "madness",
                effectPerPoint: .05
            },
            baseHitChance: 90,
            baseDamage: "player.powerLevel.times(10)",
            attributeDamageModifier: .02,
            defaultMinimumDamageMultiplier: .5,
            defaultMedianDamageMultiplier: 1,
            defaultMaximumDamageMultiplier: 1.5,
            baseMinimumDamageWeight: 5,
            baseMedianDamageWeight: 90,
            baseMaximumDamageWeight: 5
        }
    },
    debug: process.env.REACT_APP_DEBUG_MODE === "true"
}