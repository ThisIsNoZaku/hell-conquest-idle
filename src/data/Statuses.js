import * as _ from "lodash";
import validatedStatus from "./schemas/statuses";

export const FOR_COMBAT = 999;
export const PERMANENT = -1;

export const Statuses = {
    berserk: validatedStatus({
        name: "Berserk",
        icon: "./icons/icons-516.png",
        description: _.template("Your rage grants you a ${power_modifier.times(100)}% bonus to Power but multiplies the cost to downgrade incoming attacks by ${attack_downgrade_cost_multiplier.plus(1).times(100)}%."),
        effects: {
            power_modifier: {
                target: "self",
                value: .25
            },
            attack_downgrade_cost_multiplier: {
                target: "self",
                value: .25
            }
        }
    }),
    crushed: validatedStatus({
        name: "Crushed",
        icon: "./icons/icons-1.png",
        description: _.template("This Demon is being crushed, taking ${inflict_damage_at_start_of_round} at the beginning of each round."),
        effects: {
            inflict_damage_at_start_of_round: {
                target: "self",
                value: 10
            }
        }
    }),
    engorged: validatedStatus({
        name: "Engorged",
        icon: "./icons/icons-93.png",
        description: _.template("Your size gives a ${maximum_health_modifier.times(100)}% bonus to max Health."),
        effects: {
            maximum_health_modifier: {
                target: "self",
                value: .01
            }
        }
    }),
    frightened: validatedStatus({
        name: "Terrified",
        icon: "icons/icons-130.png",
        description: _.template("The fear in your heart inflicts a ${precision_modifier.times(100)}% penalty to Precision and a ${power_modifier.times(100)}% penalty to Power."),
        effects: {
            precision_modifier: {
                target: "self",
                value: -.2
            },
            power_modifier: {
                target: "self",
                value: -.2
            }
        }
    }),
    infected: validatedStatus({
        name: "Infected",
        icon: "icon/icons-1.png",
        description: _.template(""),
        effects: {
            maximum_health_modifier: {
                target: "self",
                value: -.01
            }
        }
    }),
    restrained: validatedStatus({
        name: "Restrained",
        description: _.template("Your limbs are bound, multiplying attack upgrade cost by ${attack_upgrade_cost_multiplier.times(100)}% and attack downgrade cost by ${attack_downgrade_cost_multiplier.times(100)}."),
        icon: "icons/icons-116.png",
        effects: {
            attack_downgrade_cost_multiplier: {
                target: "self",
                value: .1
            },
            attack_upgrade_cost_multiplier: {
                target: "self",
                value: .1
            }
        }
    }),
    poisoned: validatedStatus({
        name: "Poisoned",
        description: _.template("Take ${inflict_damage_at_start_of_round} damage per round."),
        icon: "icons/icons-129.png",
        effects: {
            inflict_damage_at_start_of_round: {
                target: "self",
                value: 1
            }
        }
    }),
    famished: validatedStatus({
        name: "Famished",
        icon: "icons/icons-149.png",
        description: _.template("Reduce your maximum health by ${maximum_health_modifier}%"),
        effects: {
            maximum_health_modifier:{
                target: "self",
                value: -.01
            }
        }
    })
}