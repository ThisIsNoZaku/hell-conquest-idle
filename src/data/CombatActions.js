export const AttackActions = {
    powerAttack: {
        name: "Power",
        energyCostMultiplier: 1.5,
        hitLevel: 1,
        performsAttack: true
    },
    simpleAttack: {
        name: "Basic",
        energyCostMultiplier: 1,
        hitLevel: 0,
        performsAttack: true
    },
    none: {
        name: "None",
        energyCostMultiplier: 0,
        hitLevel: -2,
        performsAttack: false
    }
}

export const DefenseActions = {
    none: {
        name: "None",
        energyCostMultiplier: 0,
        hitLevelModifier: 0
    },
    block: {
        name: "Block",
        energyCostMultiplier: 1,
        hitLevelModifier: -1
    },
    dodge: {
        name: "Dodge",
        energyCostMultiplier: 2,
        hitLevelModifier: -99
    }
}