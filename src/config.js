export const config = {
    manualSpeedup: {
        enabled: false,
        multiplier: 2
    },

    actionLog: {
        maxSize:  process.env.REACT_APP_MAX_ACTIONLOG_SIZE || 20,
    },
    encounters: {
        huntableLevel: "playerLevel.minus(config.encounters.lesserLevelScale)",
        lesserEncounterChanceWeight: 20,
        greaterEncounterChanceWeight: 20,
        evenEncounterChanceWeight: 60,
        lesserLevelScale: 20, // A demon is "lesser" than another when its level is this much lower.
        lesserLevelFloor: 5,
        greaterLevelScale: 1, // A demon is "greater" than another when its level is this much higher.
        greaterLevelCap: 1,
        chanceToIntimidateLesser: "player.powerLevel.minus(enemy.powerLevel).times(25).plus(Decimal.max(Decimal(player.attributes.deceit).minus((enemy && enemy.attributes.cunning)), 0).times(5))",
        chanceToEscapeGreater: "player.powerLevel.gt(enemy.powerLevel) ? 100 : Decimal.max(enemy.powerLevel.minus(player.powerLevel), 1).times(25).plus(Decimal.max(Decimal(player.attributes.cunning).minus((enemy && enemy.attributes.deceit) || 0), 0).times(5))",
        lesserDemonInstantKillLevel: "Decimal(highestLevelEnemyDefeated).minus(5)",
        enemies: {
            latentPower: "Decimal.max(0, encounterLevel.minus(1).times(25))",
        },
        minimumLevelForGreaterEncounters: 5
    },

    mechanics: {
        artifacts: {
            enabled: process.env.REACT_APP_FEATURE_ARTIFACTS_ENABLED || false
        },
        reincarnation: {
            bonusPointsForHighestLevel: "Decimal.sqrt(highestLevel).times(2).ceil()",
            latentPowerGainOnReincarnate: "player.powerLevel.times(5)",
            latentPowerEffectScale: .01,
            latentPowerModifier: "Decimal.min(latentPower, highestLevelReached).plus(latentPower.minus(Decimal.min(latentPower, highestLevelReached).sqrt())",
            traitPointCost: "Decimal.max(1, traitsOwned.times(2))",
            attributePointCost: "Decimal.max(1, attributeScore)"
        },
        xp: {
            gainedFromGreaterDemon: "enemy.powerLevel",
            gainedFromLesserDemon: "enemy.powerLevel",
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
                pointsPerLevel: 5,
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
    debug: process.env.REACT_APP_DEBUG_MODE === "true"
}