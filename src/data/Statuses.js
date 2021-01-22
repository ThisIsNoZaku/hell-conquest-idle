import * as _ from "lodash";
import validatedStatus from "./schemas/statuses";

export const Statuses = {
    berserk: validatedStatus({
        name: "Berserk",
        icon: "./icons/icons-516.png",
        description: _.template("Your rage grants you a ${power_modifier.times(100)}% bonus to Power but multiplies the cost to downgrade incoming attacks by ${attack_downgrade_cost_multiplier.times(100)}%."),
        effects: {
            power_modifier: {
                target: "self",
                modifier: .25
            },
            attack_downgrade_cost_multiplier: {
                target: "self",
                modifier: .25
            }
        }
    }),
    engorged: validatedStatus({
        name: "Engorged",
        icon: "./icons/icons-1.png",
        description: _.template("Your size gives a ${health_modifier.times(100)}% bonus to max Health."),
        effects: {
            maximum_hp_multiplier: {
                target: "self",
                modifier: .01
            }
        }
    }),
    terrified: validatedStatus({
        name: "Terrified",
        icon: "icons/icons-130.png",
        description: _.template("The fear in your heart inflicts a ${precision_modifier.times(100)}% penalty to Precision and a ${power_modifier.times(100)}% penalty to Power."),
        effects: {
            precision_modifier: {
                target: "self",
                modifier: -.1
            },
            power_modifier: {
                target: "self",
                modifier:
                -.1
            }
        }
    }),
    restrained: validatedStatus({
        name: "Restrained",
        description: _.template("Your limbs are bound, multiplying attack upgrade cost by ${attack_upgrade_cost_multiplier}% and attack downgrade cost by ${attack_downgrade_cost_multiplier}."),
        icon: "icons/icons-116.png",
        effects: {
            attack_downgrade_cost_multiplier: {
                target: "self",
                modifier: .1
            },
            attack_upgrade_cost_multiplier: {
                target: "self",
                modifier: .1
            }
        }
    }),
    agonizingPoison: validatedStatus({
        name: "Agonizing Poison",
        description: _.template("Take ${received_damage_modifier.toFixed()}% damage from attacks."),
        icon: "icons/icons-129.png",
        effects: {
            damage_modifier: {
                target: "self",
                modifier: 1.1
            }
        }
    }),
    famished: validatedStatus({
        name: "Famished",
        icon: "icons/icons-149.png",
        description: _.template("Reduce your maximum health by ${maximum_hp_multiplier}%"),
        effects: {
            maximum_hp_multiplier:{
                target: "self",
                modifier: -.01
            }
        }
    })
}