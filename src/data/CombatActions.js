export const CombatActions = {
    powerAttack: {
        name: "Power Attack",
        energyCostMultiplier: 2,
        hitLevel: 1,
        performsAction: true,
        attack: true,
        basic: true,
        initiative: 0
    },
    basicAttack: {
        name: "Basic Attack",
        attack: true,
        energyCostMultiplier: 1,
        hitLevel: 0,
        basic: true,
        performsAction: true,
        initiative: 0
    },
    none: {
        name: "None",
        energyCostMultiplier: 0,
        basic: true,
        hitLevel: -2,
        hitLevelModifier: 0,
        defense: true,
        initiative: 0
    },
    block: {
        name: "Block",
        energyCostMultiplier: .5,
        hitLevelModifier: -1,
        defense: true,
        initiative: 0
    },
    dodge: {
        name: "Dodge",
        energyCostMultiplier: 1.5,
        hitLevelModifier: -99,
        defense: true,
        initiative: 0
    }
}

export const DEFENSE_ACTIONS = ["block", "dodge", "none"];