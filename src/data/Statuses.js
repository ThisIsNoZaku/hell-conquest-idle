export const Statuses = {
    berserk: {
        name: "Berserk",
        icon: "./icons/icons-516.png",
        description: "",
        effects: {
            power_modifier: .2,
            evasion_modifier: -.1
        }
    },
    terrified: {
        name: "Terrified",
        icon: "icons/icons-130.png",
        effects: {
            skip_turn: true
        },
        decays: true
    },
    restrained: {
        name: "Restrained",
        icon: "icons/icons-1276.png",
        effects: {
            accuracy_modifier: -.1
        },
        decays: true
    }
}