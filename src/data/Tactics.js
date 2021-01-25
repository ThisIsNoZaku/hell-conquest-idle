export const Tactics = {
    aggressive: {
        title: "Aggressive",
        description: "Your tactics emphasize overwhelming power and violence.",
        modifiers: {
            attack_upgrade_cost_multiplier: -.25
        },
        strategy: {
            attack: "always",
            defend: "advantage"
        }
    },
    defensive: {
        title: "Defensive",
        description: "Your tactics emphasize caution and husbanding your strength.",
        modifiers: {
            solid_hit_received_damage_multiplier: -.25
        },
        strategy: {
            attack: "advantage",
            defend: "always"
        }
    },
    deceptive: {
        title: "Deceptive",
        description: "Your tactics emphasize disorientation and trickery.",
        modifiers: {
            downgrade_devastating_to_miss: true,
            attack_upgrade_cost_multiplier: .25
        },
        strategy: {
            attack: "advantage",
            defend: "upgraded"
        }
    }
}