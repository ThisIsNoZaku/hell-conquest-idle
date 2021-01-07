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
        lesserEncounterChanceWeight: 20,
        greaterEncounterChanceWeight: 20,
        evenEncounterChanceWeight: 60,
        lesserLevelScale: 1, // A demon is "lesser" than another when its level is this much lower.
        lesserLevelFloor: 5,
        greaterLevelScale: 1, // A demon is "greater" than another when its level is this much higher.
        greaterLevelCap: 4,
        chanceToIntimidateLesser: "player.powerLevel.minus(enemy.powerLevel).times(25).plus(Decimal.max(Decimal(player.attributes.deceit).minus((enemy && enemy.attributes.cunning)), 0).times(5))",
        chanceToEscapeGreater: "player.powerLevel.gt(enemy.powerLevel) ? 100 : Decimal.max(enemy.powerLevel.minus(player.powerLevel), 1).times(25).plus(Decimal.max(Decimal(player.attributes.cunning).minus((enemy && enemy.attributes.deceit) || 0), 0).times(5))",
        lesserDemonInstantKillLevel: "Decimal(highestLevelEnemyDefeated).minus(5)",
        enemyLatentPower: "Decimal.max(0, encounterLevel.minus(2).times(25))",
        minimumLevelForGreaterEncounters: 5
    },

    mechanics: {
        artifacts: {
            enabled: process.env.REACT_APP_FEATURE_ARTIFACTS_ENABLED || false
        },
        reincarnation: {
            bonusPointsForHighestLevel: 2,
            latentPowerGainOnReincarnate: "player.powerLevel.times(5)",
            latentPowerEffectScale: .01,
            traitPointCost: "Decimal.max(1, traitsOwned.times(2))",
            latentPowerCap: "highestLevelEnemyDefeated.times(25)",
            attributePointCost: "Decimal.max(1, attributeScore)"
        },
        xp: {
            gainedFromGreaterDemon: "enemy.powerLevel",
            gainedFromLesserDemon: "enemy.powerLevel",
            gainedFromOtherDemon: "enemy.powerLevel.times(5)"
        },
        levelToPowerEquation: "$level.eq(1) ? Decimal(0) : Decimal($level.minus(1).toNumber()).pow(2).times(10)",
        powerToLevelEquation: "Decimal(0).eq($powerPoints) ? Decimal(1) : Decimal.sqrt($powerPoints.div(10)).plus(1).floor()",
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
            playerAttributeMinimum: 1,
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
            defaultMinDamageMultiplier: .8,
            defaultMedDamageMultiplier: 1,
            defaultMaxDamageMultiplier: 1.2,
            baseMinimumDamageWeight: 5,
            baseMedianDamageWeight: 90,
            baseMaximumDamageWeight: 5
        }
    },
    debug: process.env.REACT_APP_DEBUG_MODE === "true"
}