export const Statuses = {
    berserk: {
        name: "Berserk",
        icon: "./icons/icons-516.png",
        description: "",
        effects: {
            power_multiplier: 1.2,
            evasion_multiplier: .9
        }
    },
    terrified: {
        name: "Terrified",
        icon: "",
        effects: {
            skip_turn: true
        },
        decays: true
    }
}