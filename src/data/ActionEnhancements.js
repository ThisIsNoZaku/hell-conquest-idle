export const ActionEnhancements = {
    acid: {
        additional_energy_cost_modifier: .25,
        change_damage_type: "acid"
    },
    arcane: {
        additional_energy_cost_modifier: .25,
        additional_block_damage_reduction: .15
    },
    exhausting: {
        additional_energy_cost_modifier: .25,
        on_hit: {
            trigger_effects: {
                change_fatigue: {
                    target: "enemy",
                    percentage_of_maximum_stamina: 0.01
                }
            }
        }
    },
    flame: {
        additional_energy_cost_modifier: .25,
        change_damage_type: "fire"
    },
    venom: {
        additional_energy_cost_modifier: .25,
        on_hit: {
            trigger_effects: {
                add_statuses: {
                    poisoned: {
                        target: "enemy",
                        stacks_per_level: 2,
                        duration: 5
                    }
                }
            }
        }
    }
}