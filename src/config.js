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
        lesserLevelScale: 2, // A demon is "lesser" than another when its level is this much lower.
        greaterLevelScale: 1 // A demon is "greater" than another when its level is this much higher.
    },
    characters: {
        player: {
            attributesPerLevel: 2
        }
    },
    mechanics: {
        levelToPowerEquation: "Big(10).pow(Math.floor($level.minus(1).toNumber()))",
        powerToLevelEquation: "Big(0).eq($powerPoints) ? Big(1) : $powerPoints.pow(-1).round(0, 3)",
        maxLevel: 100,
        attack: { // Determines how attack rolls work
            baseAttribute: "deceit",
            scale: 2
        },
        defense: {
            baseAttribute: "brutality",
            scale: 1
        },
        evasion: {
            baseAttribute: "cunning",
            scale: 2
        },
        attackDamage: {
            pointsPerLevel: 5,
            baseAttribute: "brutality",
            scale: 2
        },
        traitRank: {
            baseAttribute: "madness",
            scale: 2
        },
        fatigue: {
            penaltyPerPoint: 2
        },
        hp: {
            pointsPerLevel: 25,
            healingPerLevel: 25
        }
    },
    attributes: {
        brutality: {
            label: "Brutality",
            globalScaling: 1,
            description: _.template("Brutality is how savage and ruthless a Demon is. It gives a ${2 * rank}% bonus to attack damage, defense and intimidation checks."),
            icon: "icons/icons-92.png"
        },
        cunning: {
            label: "Cunning",
            globalScaling: 1,
            description: _.template("Cunning is how quick thinking a Demon is. It gives a ${2 * rank}% bonus to Evasion, and non-combat encounters."),
            icon: "icons/icons-24.png"
        },
        deceit: {
            label: "Deceit",
            globalScaling: 1,
            description: _.template("Deceit is how underhanded and manipulative a Demon is. It gives a ${2 * rank}% bonus to Accuracy and social encounters."),
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