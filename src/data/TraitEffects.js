import {DURATION_FOR_COMBAT, DURATION_PERMANENT} from "./Statuses";

export const TraitEffects = {
    acidic: {
        attack_enhancement: "acid",
        continuous: {
            trigger_effects: {
                damage_resistance: {
                    target: "self",
                    type: "acid",
                    percentage: .1
                }
            }
        }
    },
    arcane: {
        defense_enhancement: "arcane"
    },
    bloodthirsty: {
        on_hit: {
            trigger_effects: {
                add_statuses: {
                    berserk: {
                        target: "self",
                        stacks: 1,
                        duration: 3
                    }
                }
            }
        }
    },
    cannibal: {
        on_kill: {
            trigger_effects: {
                add_statuses: {
                    engorged: {
                        target: "self",
                        stacks: 5,
                        duration: DURATION_PERMANENT,
                        cumulative: true
                    }
                }
            }
        }
    },
    choking: {
        attack_enhancement: "choking"
    },
    coldBlooded: {
        continuous: {
            trigger_effects: {
                action_cost_modifier: {
                    target: "self",
                    value: -.1
                },
                energy_generation_modifier: {
                    target: "self",
                    value: -.1
                }
            }
        }
    },
    crushing: {
        attack_enhancement: "crushing",
    },
    diseased: {
        on_taking_damage: {
            trigger_effects: {
                add_statuses: {
                    infected: {
                        target: "enemy",
                        stacks: 1,
                        duration: 999
                    }
                }
            }
        }
    },
    evasive: {
        continuous: {
            trigger_effects: {
                evasion_modifier: {
                    target: "self",
                    value: .25
                }
            }
        }
    },
    exhausting: {
        attack_enhancement: "exhausting",
    },
    fiery: {
        attack_enhancement: "flame",
        continuous: {
            trigger_effects: {
                damage_resistance: {
                    target: "self",
                    type: "fire",
                    percentage: .1
                }
            }
        }
    },
    flying: {
        on_dodge: {
            trigger_effects: {
                add_statuses: {
                    untouchable: {
                        target: "self",
                        stacks: 1
                    }
                }
            }
        }
    },
    frightening: {
        on_combat_start: {
            trigger_effects: {
                add_statuses: {
                    frightened: {
                        target: "enemy",
                        stacks: 1,
                        duration: 10
                    }
                }
            }
        }
    },
    grappler: {
        on_solid_hit: {
            trigger_effects: {
                add_statuses: {
                    restrained: {
                        target: "enemy",
                        stacks: 1,
                        duration: 2
                    }
                }
            }
        },
        on_devastating_hit: {
            trigger_effects: {
                add_statuses: {
                    restrained: {
                        target: "enemy",
                        stacks: 1,
                        duration: 5
                    }
                }
            }
        }
    },
    holy: {
        attack_enhancement: "smite",
        defense_enhancement: "blessed",
        continuous: {
            trigger_effects: {
                is_damned: false
            }
        }
    },
    inscrutable: {
        continuous : {
            trigger_effects: {
                precision_modifier: {
                    target: "self",
                    value: .1
                },
                evasion_modifier: {
                    target: "self",
                    value: .1
                },
                hidden_action: {
                    target: "self"
                }
            }
        }
    },
    insubstantial: {
        continuous: {
            trigger_effects: {
                damage_modifier: {
                    target: "all",
                    value: -.25
                }
            }
        }
    },
    killer: {
        continuous: {
            trigger_effects: {
                devastating_hit_damage_multiplier: {
                    target: "self",
                    value: .5
                }
            }
        }
    },
    large: {
        continuous: {
            trigger_effects: {
                power_modifier: {
                    target: "self",
                    value: .2
                },
                resilience_modifier: {
                    target: "self",
                    value: .2
                },
                precision_modifier: {
                    target: "self",
                    value: -.1
                },
                evasion_modifier: {
                    target: "self",
                    value: -.1
                }
            }
        }
    },
    learned: {
        on_combat_start: {
            trigger_effects: {
                trait_mirror: {
                    target: "self",
                    value: 1
                }
            }
        }
    },
    masochistic: {
        on_taking_damage: {
            trigger_effects: {
                change_stamina: {
                    target: "self",
                    percentage_of_maximum_stamina: .05
                }
            }
        }
    },
    massive: {
        continuous: {
            trigger_effects: {
                power_modifier: {
                    target: "self",
                    value: .5
                },
                resilience_modifier: {
                    target: "self",
                    value: .5
                },
                precision_modifier: {
                    target: "self",
                    value: -.25
                },
                evasion_modifier: {
                    target: "self",
                    value: -.25
                }
            }
        }
    },
    mindless: {
        continuous: {
            trigger_effects: {
                damage_resistance: {
                    target: "self",
                    type: "psychic",
                    percentage: .1,
                }
            }
        }
    },
    neutralizing: {
        on_combat_start: {
            trigger_effects: {
                add_statuses: {
                    neutralizing: {
                        target: "self",
                        stacks: 3,
                        duration: DURATION_FOR_COMBAT
                    }
                }
            }
        },
        on_taking_damage: {
            trigger_effects: {
                remove_statuses: {
                    neutralizing: {
                        target: "self",
                        stacks: 1
                    }
                }
            }
        }
    },
    venomous: {
        attack_enhancement: "venom"
    },
    powerful: {
        continuous: {
            trigger_effects: {
                power_modifier: {
                    target: "self",
                    value: .5
                }
            }
        }
    },
    precise: {
        continuous: {
            trigger_effects: {
                precision_modifier: {
                    target: "self",
                    value: .25
                }
            }
        }
    },
    psychic: {
        attack_enhancement: "psychic"
    },
    regenerative: {
        on_round_end: {
            trigger_effects: {
                change_health: {
                    target: "self",
                    percentage_of_current_stamina: .01
                },
                change_stamina: {
                    target: "self",
                    percentage_of_current_stamina: -.1
                }
            }
        }
    },
    relentless: {
        continuous: {
            trigger_effects: {
                maximum_stamina_modifier: {
                    target: "self",
                    value: .25
                },
                energy_generation_modifier: {
                    target: "self",
                    value: .25
                }
            }
        }
    },
    reversal: {
        on_status_applied: {
            conditions: {
                target_character_is: {
                    target: "self"
                },
                source_character_is: {
                    target: "enemy"
                }
            },
            trigger_effects: {
                reflect_statuses: {
                    target: "enemy",
                    value: .25
                }
            }
        }
    },
    robust: {
        continuous: {
            trigger_effects: {
                maximum_health_modifier: {
                    target: "self",
                    value: .5
                }
            }
        }
    },
    sadistic: {
        on_hit: {
            trigger_effects: {
                change_stamina: {
                    target: "self",
                    percentage_of_maximum_stamina: .05
                }
            }
        }
    },
    summonDarkness: {
        defense_enhancement: "darknessSummoning",
    },
    swarming: {
        on_round_end: {
            trigger_effects: {
                change_health: {
                    target: "enemy",
                    value: 5
                }
            }
        }
    },
    small: {
        continuous: {
            trigger_effects: {
                power_modifier: {
                    target: "self",
                    value: -.1
                },
                resilience_modifier: {
                    target: "self",
                    value: -.1
                },
                evasion_modifier: {
                    target: "self",
                    value: .2
                },
                precision_modifier: {
                    target: "self",
                    value: .2
                }
            }
        }
    },
    swift: {},
    thorns: {
        on_taking_damage: {
            trigger_effects: {
                reflect_damage: {
                    type: "psychic",
                    value: .25
                }
            }
        }
    },
    tiny: {
        continuous: {
            trigger_effects: {
                power_modifier: {
                    target: "self",
                    value: -.25
                },
                resilience_modifier: {
                    target: "self",
                    value: -.25
                },
                evasion_modifier: {
                    target: "self",
                    value: .5
                },
                precision_modifier: {
                    target: "self",
                    value: .5
                }
            }
        }
    },
    tough: {
        continuous: {
            trigger_effects: {
                resilience_modifier: {
                    target: "self",
                    value: .25
                }
            }
        }
    },
    unstoppable: {
        continuous: {
            trigger_effects: {
                block_cost_modifier: {
                    target: "enemy",
                    value: .25
                }
            }
        }
    },
    vampiric: {
        on_hit: {
            trigger_effects: {
                change_health: {
                    target: "self",
                    percentage_of_maximum_health: .1
                }
            }
        }
    }
}