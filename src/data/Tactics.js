export const Tactics = {
    offensive: {
        overwhelm: {
            title: "Overwhelming",
            description: "",
            strategy: "power",
            actions: ["acidSpit", "fireBlast", "powerAttack"],
            energyCeiling: 0, // Always spend energy to perform actions if energy is above this percentage.
            energyFloor: 0
        },
        attrit: {
            title: "Attrition",
            description: "",
            strategy: "attrition",
            actions: ["arcaneShield", "acidSpit", "fireBlast", "basicAttack"],
            energyCeiling: .8, // Always spend energy to perform actions if energy is above this percentage.
            energyFloor: .5 // Don't spend energy to perform actions if energy is below this percentage
        },
        counter: {
            title: "Counter",
            description: "",
            strategy: "counter",
            actions: ["acidSpit", "fireBlast", "powerAttack", "arcaneShield"],
            energyCeiling: .75, // Always spend energy to perform actions if energy is above this percentage.
            energyFloor: .25 // Don't spend energy to perform actions if energy is below this percentage
        }
    },
    defensive: {
        none: {
            title: "No Defense",
            description: "",
            strategy: "none",
            actions: ["block"],
            energyCeiling: 1, // Always spend energy to perform actions if energy is above this percentage.
            energyFloor: 1 // Don't spend energy to perform reactions if energy is below this percentage
        },
        block: {
            title: "Block",
            description: "",
            strategy: "block",
            actions: ["block"],
            energyCeiling: 0,
            energyFloor: 0,
        },
        dodge: {
            title: "Evade",
            description: "",
            strategy: "dodge",
            actions: ["dodge"],
            energyCeiling: .25,
            energyFloor: 0
        }
    },
}