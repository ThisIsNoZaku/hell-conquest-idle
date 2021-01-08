import * as _ from "lodash";
import { validatedTrait } from "./schemas/traits";

// FIXME: Implement validation
export const Traits = {
    bloodrage: validatedTrait({
        name: "Blood Rage",
        icon: "icons/icons-139.png",
        description: _.template("This demon's unquenchable thirst for blood causes it to gain ${rank} stacks of Berserk when an enemy has 50% or less health."),
        on_round_end: {
            conditions : {
                health_percentage: {
                    target: "any_enemy",
                    below: 50
                }
            },
            effects: {
                add_statuses: {
                    berserk: {
                        target: "acting_character",
                        rank: "rank"
                    }
                }
            }
        }
    }),
    cupidity: validatedTrait({
        name: "Cupidity",
        icon: "icons/icons-2503.png",
        description: _.template("When this demon successfully Intimidates another demon, it gains a <span style='color: red'>${rank}%</span> chance to seize the intimidated demon's Artifacts as though it were killed."),
        on_intimidate: {
            conditions: {
                chance: "$rank"
            },
            effects: {
                steal_item: {
                    target: "all_enemies"
                }
            }
        }
    }),
    exhaustingTouch: validatedTrait({
        name: "Strangulation",
        icon: "icons/icons-115.png",
        description: _.template("The demon's touch saps the strength from the victims limbs, reducing both Damage and Defense by <span>${rank.times(5)}%</span> for 1 round.")
    }),
    inescapableGrasp: validatedTrait({
        name: "Inescapable Grasp",
        icon: "icons/icons-2221.png",
        description: _.template("You bind your victims when you strike, causing ${rank} levels of Restrained when you hit with an attack."),
        on_critical_hit: {
            conditions: {
                chance: 100
            },
            effects: {
                add_statuses: {
                    restrained: {
                        target: "target_character",
                        rank: "rank"
                    }
                }
            }
        }
    }),
    sadisticJoy: validatedTrait({
        name: "Sadistic Joy",
        icon: "icons/icons-852.png",
        description: _.template("The demon gains vile pleasure from the pain it inflicts, absorbing an additional ${rank.times(25)}% power from killing other demons."),
        on_kill: {
            effects: {
                power_gain_modifier: "rank.times(.25)"
            }
        }
    }),
    piercingStrike: validatedTrait({
        name: "Piercing Strike",
        icon: "icons/icons-113.png",
        description: _.template("Your fierce attacks can punch right through even armor. Your <span style='color: lightgreen'>Precision</span> is increased by <span style='color: orangered'>${rank.times(25)}%</span>"),
        continuous: {
            effects: {
                precision_modifier: {
                    target: "self",
                    modifier: "rank.times(.1)"
                }
            }
        }
    }),
    searingVenom: validatedTrait({
        name: "Searing Venom",
        icon: "icons/icons-4.png",
        description: _.template("Your agonizing venom causes such intense pain that the victim suffers an extra ${rank.times(10)}% damage from attacks."),
        continuous: {
            effects: {
                add_statuses: {

                }
            }
        }
    }),
    sharedPain: validatedTrait({
        name: "Shared Pain",
        icon: "icons/icons-146.png",
        description: _.template("You return the pain of injuries inflicted on you, reflecting <span style='color: orangered'>${rank.times(20).toFixed()}%</span> of the damage back."),
        on_taking_damage: {
            effects: {
                damage: {
                    target: "acting_character",
                    value: "rank.times(20).div(100).times(attackDamage)"
                }
            }
        }
    }),
    terrifyingSkitter: validatedTrait({
        name: "Terrifying Skitter",
        icon: "icons/icons-2260.png",
        description: _.template("The sickening sound of your feet on the ground unnerves even other demons, making the enemy <span style='color: violet'>Terrified</span> for <span style='color: lightblue'>${rank.div(10).round(0, 0).plus(1).toFixed()}</span> round(s), stunning them."),
        on_combat_start: {
            effects: {
                add_statuses: {
                    terrified: {
                        target: "all_enemies",
                        rank: "rank.times(2)"
                    }
                }
            }
        },
    })
}

export function getTrait(traitId) {
    return Traits[traitId];
}