export const Tactics = {
    aggressive: {
        title: "Aggressive",
        description: "Your tactics emphasize overwhelming power and violence.",
        modifiers: {
            devastating_hit_damage_multiplier: .25
        },
        strategy: {
            attack_floor: .25 // Don't spend stamina to upgrade attacks at/below this %
        }
    },
    defensive: {
        title: "Defensive",
        description: "Your tactics emphasize caution and husbanding your strength.",
        modifiers: {
            attack_downgrade_cost_multiplier: .75
        },
        strategy: {
            attack_floor: .25 // Don't spend stamina to upgrade attacks at/below this %
        }
    },
    deceptive: {
        title: "Deceptive",
        description: "Your tactics emphasize disorientation and trickery.",
        modifiers: {
            always_downgrade_to_glancing: true,
            attack_downgrade_cost_multiplier: 1.75
        },
        strategy: {
            attack_floor: .25 // Don't spend stamina to upgrade attacks at/below this %
        }
    }
}