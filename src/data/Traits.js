import * as _ from "lodash";
// FIXME: Implement validation
export const Traits = {
    bloodrage: {
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
                        target: "attacker",
                        rank: "rank.div(10).ceil()"
                    }
                }
            }
        }
    },
    cupidity: {
        name: "Cupidity",
        icon: "icons/icons-2503.png",
        description: _.template("When this demon successfully Intimidates another demon, it gains a <span style='color: red'>${rank}%</span> chance to seize the intimidated demon's Artifacts as though it were killed."),
        on_intimidate: {
            conditions: {
                chance: "$rank"
            },
            effects: {
                steal_item_chance: {
                    target: "enemies"
                }
            }
        }
    },
    exhaustingTouch: {
        name: "Strangulation",
        icon: "icons/icons-115.png",
        description: _.template("The demon's touch saps the strength from the victims limbs, reducing both Damage and Defense by <span>${rank.times(5)}%</span> for 1 round.")
    },
    inescapableGrasp: {
        name: "Inescapable Grasp",
        icon: "icons/icons-2221.png",
        description: _.template("You bind your victims when you strike, causing a <span style='color: orangered'>${rank}%</span> penalty to their <span style='color: lightgreen'>Action Speed</span> for 2 rounds."),
        on_hitting: {
            effects: {
                add_modifier: {
                    speed: {
                        target: "attacked",
                        percent: "$rank.times(-1)"
                    }
                }
            },
            duration: {
                rounds: 2
            }
        }
    },
    murderousFrenzy: {
        name: "Murderous Frenzy",
        icon: "icons/icons-118.png",
        description: _.template("After hitting with an attack this Demon frenzies, gaining a <span style='color: orangered'>${rank}%</span> bonus to <span style='color: lightgreen'>Attack Speed</span> for 2 rounds."),
        on_hitting: {
            effects: {
                add_modifier: {
                    speed: {
                        target: "attacker",
                        percent: "$rank"
                    }
                }
            },
            duration: {
                rounds: 2
            }
        }
    },
    piercingStrike: {
        name: "Piercing Strike",
        icon: "icons/icons-113.png",
        description: _.template("Your relentless attacks are designed to get around the enemy's defenses. Against your attacks the enemy's <span style='color: lightgreen'>Defense</span> is reduced by <span style='color: orangered'>${rank}%</span>"),
        on_hitting: {
            effects: {
                defense_modifier: {
                    percent: "$rank.times(-1)"
                }
            }
        }
    },
    sharedPain: {
        name: "Shared Pain",
        icon: "icons/icons-146.png",
        description: _.template("You return the pain of injuries inflicted on you, reflecting <span style='color: orangered'>${rank.times(5).toFixed()}%</span> of the damage back."),
        on_taking_damage: {
            effects: {
                target: "attacker",
                damage: "$rank.times(5).div(100).times(attackDamage)"
            }
        }
    },
    terrifyingSkitter: {
        name: "Terrifying Skitter",
        icon: "icons/icons-2260.png",
        description: _.template("The sickening sound of your feet on the ground unnerves even other demons, making the enemy <span style='color: violet'>Terrified</span> for <span style='color: lightblue'>${rank.div(10).round(0, 0).plus(1).toFixed()}</span> round(s), stunning them."),
        on_combat_start: {
            effects: {
                add_modifier: {
                    stunned: {
                        target: "all_enemies"
                    }
                }
            },
            duration: {
                rounds: "$rank.div(10).round(0, 0).plus(1)"
            }
        }
    },
}

export function getTrait(traitId) {
    return Traits[traitId];
}