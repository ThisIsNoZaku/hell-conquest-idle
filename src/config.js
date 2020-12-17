console.log(process.env.REACT_APP_DEBUG_MODE, typeof process.env.REACT_APP_DEBUG_MODE);

export const config = {
    manualSpeedup: {
        enabled: true
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
    attributes: {
        brutality: {
            label: "Brutality",
            globalScaling: 1
        },
        cunning: {
            label: "Cunning",
            globalScaling: 1
        },
        deceit: {
            label: "Deceit",
            globalScaling: 1,
        },
        madness: {
            label: "Madness",
            globalScaling: 1
        }
    },
    combat: {
        defaultMinimumDamageMultiplier: .5,
        defaultMedianDamageMultiplier: 1,
        defaultMaximumDamageMultiplier: 1.5
    },
    debug: process.env.REACT_APP_DEBUG_MODE === "true"
}