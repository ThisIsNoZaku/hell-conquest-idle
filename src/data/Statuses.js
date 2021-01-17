import * as _ from "lodash";

export const Statuses = {
    berserk: {
        name: "Berserk",
        icon: "./icons/icons-516.png",
        description: _.template("Your rage grants you a ${power_modifier}% bonus to Power but multiplies the cost to downgrade incoming attacks by ${attack_downgrade_cost_multiplier}%."),
        effects: {
            power_modifier: .25,
            attack_downgrade_cost_multiplier: 1.25
        }
    },
    terrified: {
        name: "Terrified",
        icon: "icons/icons-130.png",
        description: _.template("The fear in your heart inflicts a ${precision_modifier}% penalty to Precision and a ${power_modifier}% penalty to Power."),
        effects: {
            precision_modifier: -.2,
            power_modifier: -.2
        },
        decays: true
    },
    restrained: {
        name: "Restrained",
        description: _.template("Your limbs are bound, multiplying attack upgrade cost by ${attack_upgrade_cost_multiplier}% and attack downgrade cost by ${attack_downgrade_cost_multiplier}."),
        icon: "icons/icons-116.png",
        effects: {
            attack_downgrade_cost_multiplier: 1.10,
            attack_upgrade_cost_multiplier: 1.10
        },
        decays: true
    },
    agonizingPoison: {
        name: "Agonizing Poison",
        description: _.template("Take ${received_damage_modifier.toFixed()}% damage from attacks."),
        icon: "icons/icons-129.png",
        effects: {
            received_damage_modifier: 1.1
        }
    },
    famished: {
        name: "Famished",
        icon: "icons/icons-149.png",
        effects: {
            maximum_hp_multiplier: -.01
        }
    }
}