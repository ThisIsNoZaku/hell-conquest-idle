export const Tactics = {
    aggressive: {
        title: "Aggressive",
        description: "Your tactics emphasize overwhelming power and violence.",
        modifiers: {
            power_modifier: .25,
            health_modifier: .25,
            attack_upgrade_cost_multiplier: .75
        }
    },
    defensive: {
        title: "Defensive",
        description: "Your tactics emphasize caution and husbanding your strength.",
        modifiers: {
            resilience_modifier: .25,
            fatigue_multiplier: .75,
            attack_downgrade_cost_multiplier: .75
        }
    },
    deceptive: {
        title: "Deceptive",
        description: "Your tactics emphasize disorientation and trickery.",
        modifiers: {
            precision_modifier: .25,
            evasion_modifier: .25,
            always_downgrade_to_glancing: true
        }
    }
}