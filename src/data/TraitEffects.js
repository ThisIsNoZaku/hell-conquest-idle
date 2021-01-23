export const TraitEffects = {
    arcane: {
        continuous: {
            trigger_effects: {
                arcaneShield: {
                    target: "self",
                    value: "tier.times(.1)"
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
                        stacks: "tier",
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
                        stacks: "tier",
                        duration: -1,
                        cumulative: true,
                        max: "tier.times(10)"
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
                        stacks: "tier"
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
                    modifier: "tier.times(.1)"
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
                    value: "rank.times(.05)"
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
                        stacks: "tier",
                        duration: 5
                    }
                }
            }
        }
    },
    grappler: {
        on_hit: {
            trigger_effects: {
                add_statuses: {
                    restrained: {
                        target: "enemy",
                        stacks: "tier"
                    }
                }
            }
        }
    },
    insubstantial: {
        continuous: {
            trigger_effects: {
                damage_modifier: {
                    target: "self",
                    value: "tier.times(.05).times(-1)"
                }
            }
        }
    },
    killer: {
        continuous: {
            trigger_effects: {
                devastating_hit_damage_multiplier: {
                    target: "self",
                    modifier: "tier.times(.1)"
                }
            }
        }
    },
    large: {
        continuous: {
            trigger_effects: {
                power_modifier: {
                    target: "self",
                    modifier: "tier.times(.1)"
                },
                resilience_modifier: {
                    target: "self",
                    modifier: "tier.times(.1)"
                },
                precision_modifier: {
                    target: "self",
                    modifier: "tier.times(.05).times(-1)"
                },
                evasion_modifier: {
                    target: "self",
                    modifier: "tier.times(.05).times(-1)"
                }
            }
        }
    },
    learned: {
        continuous: {
            trigger_effects: {
                trait_mirror: {
                    target: "self",
                    value: "tier"
                }
            }
        }
    },
    mindless: {
        continuous: {
            trigger_effects: {
                damage_resistance: {
                    target: "self",
                    value: "tier.times(.1)",
                    type: "psychic"
                }
            }
        }
    },
    painfulVenom: {
        on_hit: {
            trigger_effects: {
                add_statuses: {
                    painfulVenom: {
                        target: "enemy",
                        stacks: "tier",
                        duration: 2
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
                    modifier: "tier.times(.1)"
                }
            }
        }
    },
    precise: {
        continuous: {
            trigger_effects: {
                precision_modifier: {
                    target: "self",
                    modifier: "tier.times(.1)"
                }
            }
        }
    },
    regenerative: {
        on_round_end: {
            trigger_effects: {
                health_change: {
                    target: "self",
                    value: "player.maximumHealth.times(.05)"
                },
                change_stamina: {
                    target: "self",
                    value: "player.combat.maximumStamina.times(.01).times(-1)"
                }
            }
        }
    },
    relentless: {
        continuous: {
            trigger_effects: {
                maximum_stamina_modifier: {
                    target: "self",
                    modifier: "tier.times(.2)"
                }
            }
        }
    },
    robust: {
        continuous: {
            trigger_effects: {
                maximum_health_modifier: {
                    target: "self",
                    modifier: "tier.times(.1)"
                }
            }
        }
    },
    sadistic: {
        on_hit: {
            trigger_effects: {
                change_stamina: {
                    target: "self",
                    value: "tier.times(.1).times(self.combat.maximumStamina)"
                }
            }
        }
    },
    swarming: {
        continuous: {
            trigger_effects: {
                minimum_damage: {
                    target: "self",
                    value: "self.combat.baseDamage.times(tier).times(.05)"
                }
            }
        }
    },
    small: {
        continuous: {
            trigger_effects: {
                power_modifier: {
                    target: "self",
                    modifier: "tier.times(.05).times(-1)"
                },
                evasion_modifier: {
                    target: "self",
                    modifier: "tier.times(.1)"
                },
                precision_modifier: {
                    target: "self",
                    modifier: "tier.times(.1)"
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
                    modifier: "tier.times(.1)"
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