export const Creatures = {
    bloodthirstyKnight: {
        name: "Bloodthirsty Knight",
        traits: ["bloodrage"],
        enabled: true,
        appearance: "bloodthirstyKnight",
        texture: "01_warrior.png",
        description: "A ruthless warrior who delighted in slaughtering whoever they encounter on the battlefield.",
        npc: {
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "overwhelm",
                    defensive: "block"
                }
            }
        }
    },
    condemnedSlasher: {
        name: "Condemned Slasher",
        traits: ["sadisticJoy"],
        enabled: true,
        appearance: "condemnedSlasher",
        texture: "03_rogue.png",
        description: "A madman who gained exquisite pleasure from seeing how many cuts could be made in a victim's body before they died.",
        npc: {
            adjective: "mad",
            tactics: {
                default: {
                    offensive: "overwhelm",
                    defensive: "none"
                }
            }
        }
    },
    crushingSnake: {
        name: "Crushing Snake",
        traits: ["inescapableGrasp"],
        enabled: true,
        appearance: "crushingSnake",
        texture: "06_snake_01.png",
        description: "A monstrous reptile which wraps around its prey, crushing the like out of them.",
        npc: {
            adjective: "devious",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    },
    deadlyHornet: {
        name: "Deadly Hornet",
        traits: ["piercingStrike"],
        enabled: true,
        appearance: "deadlyHornet",
        texture: "12_wasp.png",
        description: "An insect whose stinger is able to pierce even metal protection.",
        npc: {
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "dodge"
                }
            }
        }
    },
    rapaciousHighwayman: {
        name: "Rapacious Highwayman",
        traits: ["cupidity"],
        enabled: false,
        appearance: "rapaciousHighwayman",
        texture: "02_hunter.png",
        description: "A thief who stole from whomever he could get away with, from wealthy merchants to starving vagrants.",
        npc: {
            adjective: "deceptive",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    },
    searingFangViper: {
        name: "Searing-Fang Viper",
        traits: ["searingVenom"],
        enabled: true,
        appearance: "searingFangViper",
        texture: "07_snake_02.png",
        description: "A striking snake, whose venom inflicts horrific agony to its victims.",
        npc: {
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    },
    skitteringHorror: {
        name: "Skittering Horror",
        traits: ["terrifyingSkitter"],
        enabled: true,
        appearance: "skitteringHorror",
        texture: "10_spider.png",
        description: "A massive spider that enjoys stalking its prey, frightening it by the sickening skittering of it's arachnid legs.",
        npc: {
            adjective: "mad",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    },
    tormentedDead: {
        name: "Tormented Dead",
        traits: ["sharedPain"],
        enabled: true,
        appearance: "tormentedDead",
        texture: "29_zombie.png",
        description: "A human denied eternal rest and in agony from its ruined flesh.",
        npc: {
            adjective: "mad",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "none"
                }
            }
        }
    },
    wheezingApparition: {
        name: "Wheezing Apparition",
        traits: ["exhaustingTouch"],
        enabled: false,
        appearance: "wheezingApparition",
        texture: "128_sorrowsworn.png",
        description: "A soul of someone killed by strangulation, searching endlessly for victims upon which it can inflict the same fate.",
        npc: {
            adjective: "devious",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    },
    bloodyBat: {
        name: "Bloody Bat",
        traits: ["swiftEvasion"],
        enabled: true,
        appearance: "bloodyBat",
        description: "This hunter stalks the night, swooping down upon it's prey.",
        texture: "13_bat.png",
        npc: {
            adjective: "devious",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "dodge"
                }
            }
        }
    },
    myrmidonWarrior: {
        name: "Myrmidon",
        traits: ["relentless"],
        enabled: true,
        appearance: "myrmidonWarrior",
        description: "A warrior of an ant-like people, seeing all around them as enemies of it's ancient hive.",
        texture: "14_ant.png",
        npc: {
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "block"
                }
            }
        }
    },
    scorpion: {
        name: "Scorpion",
        traits: ["killingBlow"],
        enabled: true,
        appearance: "scorpion",
        description: "A deadly scorpion which injects burning venom via its massive stinger.",
        texture: "16_scorpion.png",
        npc: {
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "block"
                }
            }
        }
    },
    carrionBeetle: {
        name: "Corpse Beetle",
        traits: ["carrion_feeder"],
        enabled: true,
        appearance: "carrionBeetle",
        description: "A swarming beetle that feasts on corpses",
        texture: "17_scarab.png",
        npc: {
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "block"
                }
            }
        }
    },
    fleshlessSoldier: {
        name: "Fleshless Soldier",
        traits: ["immortalWarrior"],
        enabled: true,
        appearance: "fleshlessSoldier",
        description: "Even the dead have not seen the end of war.",
        texture: "18_skeleton.png",
        npc: {
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "none"
                }
            }
        }
    },
    madOrc: {
        name: "Insane Orc",
        traits: ["fortressOfMadness"],
        enabled: true,
        appearance: "madOrc",
        description: "An orc warrior driven mad by a thirst for blood.",
        texture: "19_orc.png",
        npc: {
            adjective: "mad",
            tactics: {
                default: {
                    offensive: "overwhelm",
                    defensive: "none"
                }
            }
        }
    }
}

export const titles = {
    mad: {
        name: "Mad",
        attributeMultipliers: {
            brutality: 1,
            cunning: 1,
            deceit: 1,
            madness: 2
        }
    },
    savage: {
        name: "savage",
        attributeMultipliers: {
            brutality: 2,
            cunning: 1,
            deceit: 1,
            madness: 1
        }
    },
    devious: {
        name: "Devious",
        attributeMultipliers: {
            brutality: 1,
            cunning: 2,
            deceit: 1,
            madness: 1
        }
    },
    underhanded: {
        name: "Underhanded",
        attributeMultipliers: {
            brutality: 1,
            cunning: 1,
            deceit: 2,
            madness: 1
        }
    }
}

export function assertCreatureExists(id) {
    if (!Creatures[id]) {
        throw new Error(`No creature with id ${id} is defined`);
    }
}