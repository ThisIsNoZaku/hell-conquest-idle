import * as _ from "lodash";

export const Traits = {
    bloodrage: {
        name: "Blood Rage",
        icon: "icons/icons-139.png",
        description: _.template("This demon's unquenchable thirst for blood gives a <span style='color: red'>${rank}%</span> bonus to Damage against enemies with <span style='color: red'>50% or less</span> health."),
        on_hit: {
            when : {
                target_health_below_percentage: 50
            },
            effects: {
                damage_bonus_percent: "$rank"
            }
        }
    },
    cupidity: {
        name: "Cupidity",
        icon: "icons/icons-2503.png",
        description: _.template("When this demon successfully Intimidates another demon, it gains a <span style='color: red'>${rank}%</span> chance to seize the intimidated demon's Artifacts as though it were killed."),
        on_intimidate: {
            effects: {
                steal_item_chance: "$rank"
            }
        }
    },
    murderousFrenzy: {
        name: "Murderous Frenzy",
        icon: "icons/icons-118.png",
        description: _.template("When this demon hit an enemy with an attack, it frenzies, gaining a <span style='color: red'>${rank}%</span> bonus to <span style='color: red'>Speed</span> for 5 rounds."),
        on_hitting: {
            effects: {
                self_speed_bonus_percent: "$rank"
            },
            duration: {
                rounds: 5
            }
        }
    },
    inescapableGrasp: {
        name: "Inescapable Grasp",
        icon: "icons/icons-2221.png",
        description: _.template("You bind your victims when you strike, causing a <span style='color: red'>${rank}%</span> penalty to their <span style='color: red'>Speed</span> for 5 rounds."),
        on_hitting: {
            effects: {
                target_speed_penalty_percent: "$rank"
            },
            duration: {
                rounds: 5
            }
        }
    },
    terrifyingSkitter: {
        name: "Terrifying Skitter",
        icon: "icons/icons-2260.png",
        description: _.template("The sickening sound of your feet on the ground unnerves even other demons, giving a <span style='color: red'>${rank}%</span> chance to gain the Frightened status at the beginning of combat for 5 rounds."),
        on_combat_start: {
            trigger: {
                percentage_chance: "$rank"
            },
            effects: {
                apply_status: {
                    status: "frightened"
                }
            }
        }
    }
}

export function getTrait(traitId) {
    return Traits[traitId];
}