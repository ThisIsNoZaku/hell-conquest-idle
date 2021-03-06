import * as _ from "lodash";
import validatedStatus from "./schemas/statuses";

export const DURATION_FOR_COMBAT = 999;
export const DURATION_PERMANENT = -1;

export const Statuses = {
    berserk: validatedStatus({
        name: "Berserk",
        icon: "./icons/icons-516.png",
        description: _.template("Your rage grants you a ${power_modifier.times(100)}% bonus to Power but reduces Evasion by ${evasion_modifier.times(100)}%."),
        effects: {
            power_modifier: {
                target: "self",
                value: .25
            },
            evasion_modifier: {
                target: "self",
                value: -.25
            }
        }
    }),
    corroding: validatedStatus({
        name: "Corroding",
        icon: "./icons/icons-353.png",
        description: _.template("This demon's flesh is being destroyed by acid, taking ${inflict_damage_at_start_of_round} at the beginning of each round."),
        effects: {
            inflict_damage_at_start_of_round: {
                target: "self",
                value: 10
            }
        }
    }),
    crushed: validatedStatus({
        name: "Crushed",
        icon: "./icons/icons-155.png",
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
        icon: "./icons/icons-130.png",
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
        icon: "./icons/icons-365.png",
        description: _.template("Disease reduces your maximum HP by ${maximum_health_modifier}%."),
        effects: {
            maximum_health_modifier: {
                target: "self",
                value: -.01
            }
        }
    }),
    neutralizing: validatedStatus({
        name: "Neutralizing",
        icon: "./icons/icons-121.png",
        description: _.template("Increases the cost multiplier of the enemy's attack and defense enhancements by ${enhancement_cost_increase.times(100)}%"),
        effects: {
            enhancement_cost_increase: {
                target: "enemy",
                value: .1
            }
        }
    }),
    restrained: validatedStatus({
        name: "Restrained",
        description: _.template("Your limbs are bound, reducing Evasion by ${evasion_modifier.times(100)}%."),
        icon: "./icons/icons-116.png",
        effects: {
            evasion_modifier: {
                target: "self",
                value: -.2
            }
        }
    }),
    poisoned: validatedStatus({
        name: "Poisoned",
        description: _.template("Take ${inflict_damage_at_start_of_round} damage per round."),
        icon: "./icons/icons-129.png",
        effects: {
            inflict_damage_at_start_of_round: {
                target: "self",
                value: 1,
                damageType: "acid"
            }
        }
    }),
    famished: validatedStatus({
        name: "Famished",
        icon: "./icons/icons-149.png",
        description: _.template("Reduce your maximum health by ${maximum_health_modifier}%"),
        effects: {
            maximum_health_modifier:{
                target: "self",
                value: -.01
            }
        }
    }),
    untouchable: validatedStatus({
        name: "Untouchable",
        icon: "./icons/icons-602.png",
        description: _.template("You cannot be hit by most attacks"),
        effects: {
            untargetable: {
                target: "self"
            }
        }
    })
}