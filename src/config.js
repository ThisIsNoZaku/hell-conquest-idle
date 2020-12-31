import * as _ from "lodash";
console.log(process.env.REACT_APP_DEBUG_MODE, typeof process.env.REACT_APP_DEBUG_MODE);

export const config = {
    manualSpeedup: {
        enabled: true,
        multiplier: 2
    },
    artifacts: {
        enabled: process.env.REACT_APP_FEATURE_ARTIFACTS_ENABLED || false
    },
    actionLog: {
        maxSize:  process.env.REACT_APP_MAX_ACTIONLOG_SIZE || 20,
    },
    encounters: {
        lesserEncounterChanceWeight: 10,
        greaterEncounterChanceWeight: 10,
        evenEncounterChanceWeight: 80,
        lesserLevelScale: 3, // A demon is "lesser" than another when its level is this much lower.
        greaterLevelScale: 1 // A demon is "greater" than another when its level is this much higher.
    },
    characters: {
        player: {
            attributesPerLevel: 2
        }
    },
    mechanics: {
        xpFromGreaterDemon: "$enemy.powerLevel",
        levelToPowerEquation: "$level.eq(1) ? Decimal(0) : Decimal(5).pow($level.minus(1).toNumber())",
        powerToLevelEquation: "Decimal(0).eq($powerPoints) ? Decimal(1) : Decimal.log($powerPoints, 5).plus(1).floor()",
        latentPowerGainOnReincarnate: "player.powerLevel.minus(1).pow(2).times(10)",
        maxLevel: 100,
        accuracy: { // Determines how accuracy rolls work
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
            healingPerLevel: 100
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
    combat: {
        baseHitChance: 90,
        attributeDamageModifier: .02,
        defaultMinimumDamageMultiplier: .5,
        defaultMedianDamageMultiplier: 1,
        defaultMaximumDamageMultiplier: 1.5,
        baseMinimumDamageWeight: 20,
        baseMedianDamageWeight: 60,
        baseMaximumDamageWeight: 20
    },
    debug: process.env.REACT_APP_DEBUG_MODE === "true"
}