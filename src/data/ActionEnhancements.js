import * as JOI from "joi";
import {onEventValidator} from "./schemas/events";

const enhancementValidation = JOI.object({
    energy_cost_modifier: JOI.number().required(),
    change_damage_type: JOI.string().valid("acid", "fire", "psychic"),
    block_damage_modifier: JOI.number(),
    damage_modifier_against_damned: JOI.number(),
    unblockable: JOI.boolean(),
    on_hit: onEventValidator
});

export const ActionEnhancements = {
    acid: validateEnhancement({
        energy_cost_modifier: .25,
        change_damage_type: "acid"
    }),
    arcane: validateEnhancement({
        energy_cost_modifier: .25,
        block_damage_modifier: -.15
    }),
    blessed: validateEnhancement({
        energy_cost_modifier: 1,
        block_damage_modifier: -100
    }),
    exhausting: validateEnhancement({
        energy_cost_modifier: .25,
        on_hit: {
            trigger_effects: {
                change_fatigue: {
                    target: "enemy",
                    percentage_of_maximum_stamina: 0.01
                }
            }
        }
    }),
    flame: validateEnhancement({
        energy_cost_modifier: .25,
        change_damage_type: "fire"
    }),
    smite: validateEnhancement({
        energy_cost_modifier: 1,
        damage_modifier_against_damned: 1
    }),
    psychic: validateEnhancement({
        energy_cost_modifier: 1,
        unblockable: true
    }),
    venom: validateEnhancement({
        energy_cost_modifier: .25,
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
    })
}

function validateEnhancement(enhancement) {
    const validationResult = enhancementValidation.validate(enhancement);
    if(validationResult.error) {
        throw new Error(validationResult.error);
    }
    return validationResult.value;
}