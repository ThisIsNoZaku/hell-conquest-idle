import * as _ from "lodash";
console.log(process.env.REACT_APP_DEBUG_MODE, typeof process.env.REACT_APP_DEBUG_MODE);

export const config = {
    manualSpeedup: {
        enabled: true,
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
        chanceToEscapeGreater: "player.powerLevel.gt(enemy.powerLevel) ? 100 : enemy.powerLevel.minus(player.powerLevel).pow(2).times(10)"
    },
    mechanics: {
        artifacts: {
            enabled: process.env.REACT_APP_FEATURE_ARTIFACTS_ENABLED || false
        },
        reincarnation: {
            bonusPointsForHighestLevel: 2,
            // latentPowerGainOnReincarnate: "player.powerLevel.minus(1).pow(2).times(10)",
            latentPowerGainOnReincarnate: 0
        },
        xp: {
            gainedFromGreaterDemon: "enemy.powerLevel",
            gainedFromLesserDemon: "enemy.powerLevel",
            gainedFromOtherDemon: "enemy.powerLevel.times(5)"
        },
        levelToPowerEquation: "$level.eq(1) ? Decimal(0) : Decimal(5).pow($level.minus(1).toNumber())",
        powerToLevelEquation: "Decimal(0).eq($powerPoints) ? Decimal(1) : Decimal.log($powerPoints, 5).plus(1).floor()",
        maxLevel: 100,
        combat: {
            randomEncounterChance: "50",
            determineHit: "roll <= config.mechanics.combat.baseHitChance ? 'hit' : 'miss'",
            precision: { // Determines how precision rolls work
                baseAttribute: "deceit",
                attributeBonusScale: 10
            },
            defense: {
                baseAttribute: "brutality",
                attributeBonusScale: 10
            },
            evasion: {
                baseAttribute: "cunning",
                attributeBonusScale: 10
            },
            attackDamage: {
                pointsPerLevel: 10,
                baseAttribute: "brutality",
                attributeBonusScale: 10
            },
            traitRank: {
                baseAttribute: "madness",
                attributeBonusScale: 10
            },
            fatigue: {
                evasionPenaltyPerPoint: 2
            },
            hp: {
                base: 50,
                pointsPerLevel: 50,
                healingPerLevel: 5
            },
            baseHitChance: 75,
            attributeDamageModifier: .02,
            defaultMinimumDamageMultiplier: .25,
            defaultMedianDamageMultiplier: 1,
            defaultMaximumDamageMultiplier: 1.5,
            baseMinimumDamageWeight: 5,
            baseMedianDamageWeight: 90,
            baseMaximumDamageWeight: 5
        }
    },
    attributes: {
        brutality: {
            label: "Brutality",
            globalScaling: 1,
            description: _.template(`Brutality is how savage and ruthless a Demon is. It gives a \${5 * rank}% bonus to attack damage, defense and intimidation checks.`),
            icon: "icons/icons-92.png"
        },
        cunning: {
            label: "Cunning",
            globalScaling: 1,
            description: _.template("Cunning is how quick thinking a Demon is. It gives a ${5 * rank}% bonus to Evasion, and non-combat encounters."),
            icon: "icons/icons-24.png"
        },
        deceit: {
            label: "Deceit",
            globalScaling: 1,
            description: _.template("Deceit is how underhanded and manipulative a Demon is. It gives a ${5 * rank}% bonus to Accuracy and social encounters."),
            icon: "icons/icons-17.png"
        },
        madness: {
            label: "Madness",
            globalScaling: 1,
            description: _.template("Madness is how disconnected from the limits of reality the Demon is. It gives a ${5 * rank}% bonus to the effect of wielded Artifacts and the effects of Traits."),
            icon: "icons/icons-124.png"
        }
    },
    debug: process.env.REACT_APP_DEBUG_MODE === "true"
}