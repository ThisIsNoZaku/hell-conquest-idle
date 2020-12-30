import * as _ from "lodash";
// FIXME: Implement validation
export const Traits = {
    bloodrage: {
        name: "Blood Rage",
        icon: "icons/icons-139.png",
        description: _.template("This demon's unquenchable thirst for blood gives a <span style='color: red'>${rank.times(10)}%</span> bonus to Damage against enemies with <span style='color: red'>50% or less</span> health."),
        on_hitting: {
            conditions : {
                health_percentage: {
                    target: "target",
                    below: 50
                }
            },
            effects: {
                damage_modifier: {
                    percent: "$rank.times(10)"
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
    murderousFrenzy: {
        name: "Murderous Frenzy",
        icon: "icons/icons-118.png",
        description: _.template("After hitting an enemy with an attack this Demon frenzies, gaining a <span style='color: orangered'>${rank}%</span> bonus to <span style='color: lightgreen'>Attack Speed</span> for 2 rounds."),
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
    inescapableGrasp: {
        name: "Inescapable Grasp",
        icon: "icons/icons-2221.png",
        description: _.template("You bind your victims when you strike, causing a <span style='color: orangered'>${rank}%</span> penalty to their <span style='color: lightgreen'>Action Speed</span> for 5 rounds."),
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
                rounds: 5
            }
        }
    },
    terrifyingSkitter: {
        name: "Terrifying Skitter",
        icon: "icons/icons-2260.png",
        description: _.template("The sickening sound of your feet on the ground unnerves even other demons, giving a <span style='color: orangered'>75%</span> chance to make the enemy <span style='color: violet'>Terrified</span> for <span style='color: lightblue'>${rank.div(10).round(0, 0).plus(1).toFixed()}</span> round(s), stunning them."),
        on_combat_start: {
            conditions: {
                chance: 50
            },
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
    }
}

export function getTrait(traitId) {
    return Traits[traitId];
}