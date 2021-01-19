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
            trigger_effects: {
                add_statuses: {
                    berserk: {
                        target: "source_character",
                        stacks: "rank",
                        duration: 999
                    }
                }
            },
            not_trigger_effects: {
                remove_statuses: {
                    berserk: {
                        target: "source_character",
                        stacks: 999
                    }
                }
            }
        }
    }),
    cannibalism: validatedTrait({
        name: "Cannibalism",
        icon: "icons/icons-1.png",
        description: _.template("When this demon kills another, it gains ${rank} stacks of of Engorged, to a maximum of ${rank.times(10)}"),
        on_kill: {
            trigger_effects: {
                add_statuses: {
                    engorged: {
                        target: "self",
                        stacks: "rank",
                        max: "rank.times(10)"
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
            trigger_effects: {
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
        description: _.template("On a critical hit you wrap around your enemy, inflicting ${rank} stack${rank.eq(1) ? '': 's'} of <em>Restrained</em> for 5 rounds."),
        on_serious_hit: {
            trigger_effects: {
                add_statuses: {
                    restrained: {
                        target: "target_character",
                        stacks: "rank",
                        duration: 5
                    }
                }
            }
        },
        on_devastating_hit: {
            trigger_effects: {
                add_statuses: {
                    restrained: {
                        target: "target_character",
                        stacks: "rank",
                        duration: 5
                    }
                }
            }
        }
    }),
    killingBlow: validatedTrait({
        name: "Killing Blow",
        description: _.template("You seek to end fights with a single strike, dealing ${rank.times(10).plus(100).toFixed()}% damage on a Devastating hit."),
        icon: "icons/icons-1.png",
        on_devastating_hit: {
            trigger_effects: {
                damage_modifier: {
                    target: "dealt",
                    modifier: "rank.times(1.1)"
                }
            }
        }
    }),
    mindlessBlows: validatedTrait({
        name: "Mindless Blows",
        icon: "./icons/icon-1.png",
        description: _.template("Your relentless attacks make your attacks hard to deflect, increasing the cost to downgrade your attacks by ${rank.times(10)}%."),
        continuous: {
            trigger_effects: {
                attack_downgrade_cost_multiplier: {
                    target: "source_character",
                    modifier: "rank.times(.1)"
                }
            }
        }
    }),
    piercingStrike: validatedTrait({
        name: "Piercing Strike",
        icon: "icons/icons-113.png",
        description: _.template("Your fierce attacks can punch right through even armor. Your <span style='color: lightgreen'>Precision</span> is increased by <span style='color: orangered'>${rank.times(25)}%</span>"),
        continuous: {
            trigger_effects: {
                precision_modifier: {
                    target: "self",
                    modifier: "rank.times(.10)"
                }
            }
        }
    }),
    relentless: validatedTrait({
        name: "Relentless",
        description: _.template("Your indomitably increases your Stamina and stamina regeneration by ${rank.times(10)}%."),
        icon: "icons/icons-110.png",
        continuous: {
            trigger_effects: {
                stamina_modifier: {
                    target: "self",
                    modifier: "rank.times(.1)"
                }
            }
        }
    }),
    sadisticJoy: validatedTrait({
        name: "Sadistic Joy",
        icon: "icons/icons-852.png",
        description: _.template("The demon gains vile pleasure from the pain it inflicts, absorbing an additional ${rank.times(25)}% power from killing other demons."),
        on_kill: {
            trigger_effects: {
                power_gain_modifier: "rank.times(.25)"
            }
        }
    }),
    searingVenom: validatedTrait({
        name: "Searing Venom",
        icon: "icons/icons-4.png",
        description: _.template("Your agonizing venom causes such intense pain that the victim suffers an extra ${rank.times(10)}% damage from attacks."),
        on_solid_hit: {
            trigger_effects: {
                add_statuses: {
                    agonizingPoison: {
                        target: "target_character",
                        stacks: "rank"
                    }
                }
            }
        },
        on_devastating_hit: {
            trigger_effects: {
                add_statuses: {
                    agonizingPoison: {
                        target: "target_character",
                        stacks: "rank"
                    }
                }
            }
        },
        on_serious_hit: {
            trigger_effects: {
                add_statuses: {
                    agonizingPoison: {
                        target: "target_character",
                        stacks: "rank"
                    }
                }
            }
        }
    }),
    sharedPain: validatedTrait({
        name: "Shared Pain",
        icon: "icons/icons-146.png",
        description: _.template("You return the pain of injuries inflicted on you, reflecting <span style='color: orangered'>${rank.times(20).toFixed()}%</span> of the damage back."),
        on_taking_damage: {
            trigger_effects: {
                inflict_damage: {
                    target: "target_character",
                    value: "rank.times(20).div(100).times(attackDamage)"
                }
            }
        }
    }),
    swiftEvasion: validatedTrait({
        name: "Swift Evasion",
        icon: "icons/icons-595.png",
        description: _.template("Your agility increases your Evasion by ${rank.times(10)}%."),
        continuous: {
            trigger_effects: {
                evasion_modifier: {
                    target: "self",
                    modifier: "rank.times(.10)"
                }
            }
        }
    }),
    terrifyingSkitter: validatedTrait({
        name: "Terrifying Skitter",
        icon: "icons/icons-2260.png",
        description: _.template("The sickening sound of your feet on the ground unnerves even other demons, making the enemy <span style='color: violet'>Terrified</span> for <span style='color: lightblue'>${rank.div(10).round(0, 0).plus(1).toFixed()}</span> round(s), stunning them."),
        on_combat_start: {
            trigger_effects: {
                add_statuses: {
                    terrified: {
                        target: "all_enemies",
                        stacks: "rank.times(2)"
                    }
                }
            }
        },
    })
}

export function getTrait(traitId) {
    return Traits[traitId];
}