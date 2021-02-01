export const AttackActions = {
    powerAttack: {
        name: "Power Attack",
        energyCostMultiplier: 1.5,
        hitLevel: 1,
        performsAction: true,
        attack: true,
        basic: true
    },
    basicAttack: {
        name: "Basic Attack",
        attack: true,
        energyCostMultiplier: 1,
        hitLevel: 0,
        basic: true,
        performsAction: true
    },
    none: {
        name: "None",
        energyCostMultiplier: 0,
        basic: true,
        hitLevel: -2,
        performsAction: false
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
        energyCostMultiplier: .75,
        hitLevelModifier: -1
    },
    dodge: {
        name: "Dodge",
        energyCostMultiplier: 2.5,
        hitLevelModifier: -99
    }
}