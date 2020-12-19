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
        lesserLevelScale: 5, // A demon is "lesser" than another when it's level is this much lower.
        greaterLevelScale: 2 // A demon is "greater" than another when it's level is this much higher.
    },
    characters: {
        player: {
            attributesPerLevel: 2
        }
    },
    attributes: {
        brutality: {
            label: "Brutality",
            globalScaling: 1,
            description: _.template("Brutality is how savage and ruthless a Demon is. It gives a ${rank}% bonus to attack damage, defense and intimidation checks."),
            icon: "icons/icons-92.png"
        },
        cunning: {
            label: "Cunning",
            globalScaling: 1,
            description: _.template("Cunning is how quick thinking a Demon is. It gives a ${rank}% bonus to Evasion, and non-combat encounters."),
            icon: "icons/icons-24.png"
        },
        deceit: {
            label: "Deceit",
            globalScaling: 1,
            description: _.template("Deceit is how underhanded and manipulative a Demon is. It gives a ${rank}% bonus to Accuracy and social encounters."),
            icon: "icons/icons-17.png"
        },
        madness: {
            label: "Madness",
            globalScaling: 1,
            description: _.template("Madness is how disconnected from the limits of reality the Demon is. It gives a ${rank}% bonus to the effect of wielded Artifacts."),
            icon: "icons/icons-124.png"
        }
    },
    combat: {
        defaultMinimumDamageMultiplier: .5,
        defaultMedianDamageMultiplier: 1,
        defaultMaximumDamageMultiplier: 1.5
    },
    debug: process.env.REACT_APP_DEBUG_MODE === "true"
}