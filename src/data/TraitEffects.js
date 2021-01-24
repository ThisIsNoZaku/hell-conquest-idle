import {PERMANENT} from "./Statuses";

export const TraitEffects = {
    arcane: {
        continuous: {
            trigger_effects: {
                arcaneShield: {
                    target: "self",
                    value: .1
                }
            }
        }
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
                        stacks: 1
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
                    modifier: .4
                }
            }
        }
    },
    fiery: {
        continuous: {
            trigger_effects: {
                elemental_attack: {
                    target: "self",
                    element: "fire"
                },
                damage_resistance: {
                    target: "self",
                    type: "fire",
                    value: .2
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
                        duration: 5
                    }
                }
            }
        }
    },
    grappler: {
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
                    modifier: .5
                }
            }
        }
    },
    large: {
        continuous: {
            trigger_effects: {
                power_modifier: {
                    target: "self",
                    modifier: .2
                },
                resilience_modifier: {
                    target: "self",
                    modifier: .2
                },
                precision_modifier: {
                    target: "self",
                    modifier: -.1
                },
                evasion_modifier: {
                    target: "self",
                    modifier: -.1
                }
            }
        }
    },
    learned: {
        continuous: {
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
                    value: .2,
                    type: "psychic"
                }
            }
        }
    },
    painfulVenom: {
        on_devastating_hit: {
            trigger_effects: {
                add_statuses: {
                    painfulVenom: {
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
                    modifier: .33
                }
            }
        }
    },
    precise: {
        continuous: {
            trigger_effects: {
                precision_modifier: {
                    target: "self",
                    modifier: .2
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
                    percentage_of_maximum_stamina: -.1
                }
            }
        }
    },
    relentless: {
        continuous: {
            trigger_effects: {
                maximum_stamina_modifier: {
                    target: "self",
                    modifier: .33
                }
            }
        }
    },
    robust: {
        continuous: {
            trigger_effects: {
                maximum_health_modifier: {
                    target: "self",
                    modifier: .2
                }
            }
        }
    },
    sadistic: {
        on_hit: {
            trigger_effects: {
                change_stamina: {
                    target: "self",
                    value: "tier.times(.05).times(self.combat.maximumStamina)"
                }
            }
        }
    },
    swarming: {
        continuous: {
            trigger_effects: {
                minimum_damage: {
                    target: "self",
                    value: "self.combat.baseDamage.times(tier).times(.1)"
                }
            }
        }
    },
    small: {
        continuous: {
            trigger_effects: {
                power_modifier: {
                    target: "self",
                    modifier: "tier.times(.1).times(-1)"
                },
                evasion_modifier: {
                    target: "self",
                    modifier: "tier.times(.2)"
                },
                precision_modifier: {
                    target: "self",
                    modifier: "tier.times(.2)"
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
                    value: "tier.times(.2).times(damageTaken)"
                }
            }
        }
    },
    tough: {
        continuous: {
            trigger_effects: {
                resilience_modifier: {
                    target: "self",
                    modifier: "tier.times(.4)"
                }
            }
        }
    },
    unstoppable: {
        continuous: {
            trigger_effects: {
                attack_downgrade_cost_multiplier: {
                    target: "enemy",
                    modifier: "tier.times(.1)"
                }
            }
        }
    },
    vampiric: {
        on_hit: {
            trigger_effects: {
                gain_health: {
                    target: "self",
                    value: "damageDealt.times(.1)"
                }
            }
        }
    }
}