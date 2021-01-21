export const Tactics = {
    aggressive: {
        title: "Aggressive",
        description: "Your tactics emphasize overwhelming power and violence.",
        modifiers: {
            power_modifier: .25,
            health_modifier: .25,
            attack_upgrade_cost_multiplier: .75
        },
        strategy: {
            attack_floor: .1 // Don't spend stamina to upgrade attacks at/below this %
        }
    },
    defensive: {
        title: "Defensive",
        description: "Your tactics emphasize caution and husbanding your strength.",
        modifiers: {
            resilience_modifier: .25,
            fatigue_multiplier: .75,
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
            precision_modifier: .25,
            evasion_modifier: .25,
            always_downgrade_to_glancing: true,
            attack_downgrade_cost_multiplier: 1.25
        },
        strategy: {
            attack_floor: .25 // Don't spend stamina to upgrade attacks at/below this %
        }
    }
}