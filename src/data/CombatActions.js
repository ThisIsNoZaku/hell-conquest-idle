export const AttackActions = {
    powerAttack: {
        name: "Power",
        energyCostMultiplier: 2,
        hitLevel: 1,
        performsAttack: true,
        basic: true
    },
    basicAttack: {
        name: "Basic",
        energyCostMultiplier: 1,
        hitLevel: 0,
        basic: true,
        performsAttack: true
    },
    none: {
        name: "None",
        energyCostMultiplier: 0,
        basic: true,
        hitLevel: -2,
        performsAttack: false
    },
    acidSpit: {
        name: "Acid Spit",
        energyCostMultiplier: 2,
        hitLevel: 0,
        damageType: "acid",
        performsAttack: true
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