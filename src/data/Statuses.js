import * as _ from "lodash";

export const Statuses = {
    berserk: {
        name: "Berserk",
        icon: "./icons/icons-516.png",
        description: _.template("Your rage grants you a ${power_modifier}% bonus to Power but a ${evasion_modifier}% penalty to Evasion."),
        effects: {
            power_modifier: .2,
            evasion_modifier: -.1
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
        description: _.template("Your limbs are bound, causing a ${accuracy_modifier}% miss chance."),
        icon: "icons/icons-116.png",
        effects: {
            accuracy_modifier: -.1
        },
        decays: true
    },
    famished: {
        name: "Famished",
        icon: "icons/icons-149.png",
        effects: {
            maximum_hp_multiplier: -.01
        }
    }
}