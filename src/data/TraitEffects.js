import {PERMANENT} from "./Statuses";

export const TraitEffects = {
    acidic: {
        attack_enhancement: {
            energy_cost_multiplier: 2,
            change_damage_type: "acid"
        },
        continuous: {
            trigger_effects: {
                damage_resistance: {
                    target: "self",
                    type: "acid",
                    percentage: 20
                }
            }
        }
    },
    arcane: {
        defense_enhancement: "arcaneShield"
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
                        stacks: 1,
                        duration: PERMANENT,
                        cumulative: true,
                        max: 10
                    }
                }
            }
        }
    },
    crushing: {
        on_solid_hit: {
            trigger_effects: {
                add_statuses: {
                    crushed: {
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
                    crushed: {
                        target: "enemy",
                        stacks: 1,
                        duration: 5
                    }
                }
            }
        }
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
                    value: .4
                }
            }
        }
    },
    fiery: {
        attack_enhancement: {
            energy_cost_multiplier: 2,
            change_damage_type: "fire"
        },
        continuous: {
            trigger_effects: {
                damage_resistance: {
                    target: "self",
                    type: "fire",
                    percentage: .2
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
    mindless: {
        continuous: {
            trigger_effects: {
                damage_resistance: {
                    target: "self",
                    type: "psychic",
                    percentage: 20,
                }
            }
        }
    },
    venomous: {
        on_solid_hit: {
            trigger_effects: {
                add_statuses: {
                    poisoned: {
                        target: "enemy",
                        stacks: 1,
                        duration: 5
                    }
                }
            }
        },
        on_devastating_hit: {
            trigger_effects: {
                add_statuses: {
                    poisoned: {
                        target: "enemy",
                        stacks: 1,
                        duration: 5
                    }
                }
            }
        }
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
    regenerative: {
        on_round_end: {
            trigger_effects: {
                health_change: {
                    target: "self",
                    percentage_of_maximum_health: .05
                },
                change_stamina: {
                    target: "self",
                    percentage_of_maximum_stamina: -.05
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
    swarming: {
        on_round_end: {
            trigger_effects: {
                health_change: {
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
                    target: "enemy",
                    type: "psychic",
                    value: .2
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
                gain_health: {
                    target: "self",
                    value: .1
                }
            }
        }
    }
}