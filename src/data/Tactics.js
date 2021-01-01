export const Tactics = {
    aggressive: {
        title: "Aggressive",
        description: "Your tactics emphasize overwhelming power and violence.",
        modifiers: {
            damage_modifier: .5,
            speed_modifier: .1
        }
    },
    defensive: {
        title: "Defensive",
        description: "Your tactics emphasize caution and husbanding your strength.",
        modifiers: {
            damage_resistance_modifier: .50,
            evasion_modifier: .25
        }
    },
    deceptive: {
        title: "Deceptive",
        description: "Your tactics emphasize disorientation and trickery.",
        modifiers: {
            enemy_accuracy_modifier: -.25,
            enemy_evasion_modifier: -.25
        }
    }
}