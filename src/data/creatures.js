import * as JOI from "joi";

const creatureValidator = JOI.object({
    name: JOI.string().required(),
    traits: JOI.array().items(JOI.string()),
    enabled: JOI.boolean(),
    appearance: JOI.string().required(),
    texture: JOI.string().required(),
    description: JOI.string().required(),
    npc: JOI.object({
        loyalty: JOI.string().valid("aterradora", "alsharu", "waru", "kakoi", "none"),
        adjective: JOI.string().required(),
        tactics: JOI.object({
            default: JOI.object({
                offensive: JOI.string().required().valid("counter", "attrit", "overwhelm"),
                defensive: JOI.string().required().valid("none", "dodge", "block")
            })
        })
    })
});

export const Creatures = {
    avalancheSpirit: validatedCreature({
        name: "Avalanche Spirit",
        traits: ["heartlessMountain"],
        enabled: true,
        appearance: "avalancheSpirit",
        texture: "25_earth_elemental.png",
        description: "A spirit",
        npc: {
            loyalty: "waru",
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "overwhelm",
                    defensive: "block"
                }
            }
        }
    }),
    bandagedMan: validatedCreature({
        name: "Bandaged Man",
        traits: ["lifetimeOfPain"],
        description: "A demon born from a man tortured for years before being burned alive.",
        texture: "35_mummy.png",
        appearance: "bandagedMan",
        npc: {
            loyalty: "kakoi",
            adjective: "mad",
            tactics: {
                default: {
                    offensive: "overwhelm",
                    defensive: "block"
                }
            }
        }
    }),
    bees: validatedCreature({
        name: "BEEEEEES!",
        appearance: "bees",
        description: "Not the bees!",
        traits: ["deadlySwarm"],
        texture: "127_bee.png",
        npc: {
            loyalty: "alsharu",
            adjective: "underhanded",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "dodge"
                }
            }
        }
    }),
    bigCrab: validatedCreature({
        name: "Just A Big Crab",
        appearance: "bigCrab",
        description: "Get the shampoo.",
        traits: ["thickSkin"],
        texture: "125_crab.png",
        npc: {
            loyalty: "kakoi",
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "overwhelm",
                    defensive: "block"
                }
            }
        }
    }),
    bitingLizard: validatedCreature({
        name: "Biting Lizard",
        appearance: "bitingLizard",
        description: "This Demon lets rotting flesh fester in its mouth to cultivate disease it infect victims with.",
        traits: ["rotMouth"],
        texture: "34_salamander.png",
        npc: {
            loyalty: "waru",
            adjective: "underhanded",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "block"
                }
            }
        }
    }),
    bloodthirstyKnight: validatedCreature({
        name: "Bloodthirsty Knight",
        traits: ["bloodrage"],
        enabled: true,
        appearance: "bloodthirstyKnight",
        texture: "01_warrior.png",
        description: "A ruthless warrior who delighted in slaughtering whoever they encounter on the battlefield.",
        npc: {
            loyalty: "kakoi",
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "overwhelm",
                    defensive: "block"
                }
            }
        }
    }),
    bloodyBat: validatedCreature({
        name: "Bloody Bat",
        traits: ["swiftEvasion"],
        enabled: true,
        appearance: "bloodyBat",
        description: "This hunter stalks the night, swooping down upon it's prey.",
        texture: "13_bat.png",
        npc: {
            loyalty: "kakoi",
            adjective: "devious",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "dodge"
                }
            }
        }
    }),
    carrionBeetle: validatedCreature({
        name: "Corpse Beetle",
        traits: ["carrion_feeder"],
        enabled: true,
        appearance: "carrionBeetle",
        description: "A beetle that swarms over victims and ravenously consumes them.",
        texture: "17_scarab.png",
        npc: {
            loyalty: "kakoi",
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "block"
                }
            }
        }
    }),
    condemnedSlasher: validatedCreature({
        name: "Condemned Slasher",
        traits: ["sadisticJoy"],
        enabled: true,
        appearance: "condemnedSlasher",
        texture: "03_rogue.png",
        description: "A madman who gained exquisite pleasure from seeing how many cuts could be made in a victim's body before they died.",
        npc: {
            loyalty: "aterradora",
            adjective: "mad",
            tactics: {
                default: {
                    offensive: "overwhelm",
                    defensive: "none"
                }
            }
        }
    }),
    creeperPeeper: validatedCreature({
        name: "Creeper Peeper",
        enabled: false,
        appearance: "creeperPeeper",
        description: "Jeepers Creepers, where'd ya get those peepers?",
        traits: ["eerieWatcher"],
        texture: "33_floating_eye.png",
        npc: {
            loyalty: "alsharu",
            adjective: "devious",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    }),
    crushingSnake: validatedCreature({
        name: "Crushing Snake",
        traits: ["inescapableGrasp"],
        enabled: true,
        appearance: "crushingSnake",
        texture: "06_snake_01.png",
        description: "A monstrous reptile which wraps around its prey, crushing the like out of them.",
        npc: {
            loyalty: "alsharu",
            adjective: "devious",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    }),
    darkElfHunter: validatedCreature({
        name: "Dark Elf Hunter",
        traits: ["spiderHunter"],
        enabled: true,
        appearance: "darkElfHunter",
        texture: "43_dark_elf_hunter.png",
        description: "A member of a spider-worshipping elven subrace used to living underground, with the ability to summon darkness.",
        npc: {
            loyalty: "waru",
            adjective: "underhanded",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    }),
    darkElfMage: validatedCreature({
        name: "Dark Elf Made",
        traits: ["spiderMage"],
        enabled: true,
        appearance: "darkElfMage",
        texture: "44_dark_elf_mage.png",
        description: "A member of a spider-worshipping elven subrace used to living underground, with the ability to summon darkness. Wields foul magic.",
        npc: {
            loyalty: "waru",
            adjective: "underhanded",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    }),
    deadlyHornet: validatedCreature({
        name: "Deadly Hornet",
        traits: ["piercingStrike"],
        enabled: true,
        appearance: "deadlyHornet",
        texture: "12_wasp.png",
        description: "An insect whose stinger is able to pierce even metal protection.",
        npc: {
            loyalty: "kakoi",
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "dodge"
                }
            }
        }
    }),
    demonLord: validatedCreature({
        name: "Demon Lord",
        traits: ["deeaboo"],
        enabled: true,
        appearance: "demonLord",
        description: "The spirit of an intelligent being which reshaped itself to a mythological form.",
        texture: "22_demon.png",
        npc: {
            loyalty: "kakoi",
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "overwhelm",
                    defensive: "block"
                }
            }
        }
    }),
    demonSummoner: validatedCreature({
        name: "Demon Summoner",
        traits: ["demonMaster"],
        enabled: true,
        description: "This human scholars life of demonology condemned him after death to an eternity to one of his subjects.",
        appearance: "demonSummoner",
        texture: "36_evil_mage.png",
        npc: {
            loyalty: "alsharu",
            adjective: "devious",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "block"
                }
            }
        }
    }),
    drowningSpirit: validatedCreature({
        name: "Drowning Spirit",
        traits: ["undertow"],
        enabled: true,
        appearance: "drowningSpirit",
        texture: "23_water_elemental.png",
        description: "A sinister spirit that saps the strength of its victims, driving them to exhaustion and death by overexertion.",
        npc: {
            loyalty: "waru",
            adjective: "underhanded",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "block"
                }
            }
        }
    }),
    eerieHierophant: validatedCreature({
        name: "Eerie Hierophant",
        traits: ["reptileMystic"],
        enabled: true,
        appearance: "eerieHierophant",
        description: "A holy man",
        texture: "39_lizardman.png",
        npc: {
            loyalty: "none",
            adjective: "mad",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    }),
    eyeBeast: validatedCreature({
        name: "Eye Beast",
        traits: ["balefulGaze"],
        enabled: true,
        appearance: "eyeBeast",
        description: "A grotesque demon, which first a variety of magical blasts from its myriad eyes.",
        texture: "31_beholder.png",
        npc: {
            loyalty: "none",
            adjective: "devious",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "dodge"
                }
            }
        }
    }),
    fireHawk: validatedCreature({
        name: "Fire Hawk",
        appearance: "fireHawk",
        traits: ["fireBird"],
        description: "A large bird able to remain aloft for days via the power of hell, occasionally swooping down to snatch prey.",
        texture: "20_bird.png",
        npc: {
            loyalty: "waru",
            adjective: "underhanded",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    }),
    fleshlessSoldier: validatedCreature({
        name: "Fleshless Soldier",
        traits: ["immortalWarrior"],
        enabled: true,
        appearance: "fleshlessSoldier",
        description: "Even the dead have not seen the end of war.",
        texture: "18_skeleton.png",
        npc: {
            loyalty: "kakoi",
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "none"
                }
            }
        }
    }),
    freakyFishGuy: validatedCreature({
        name: "Freaky Fish Guy",
        traits: ["freakyFishGuy"],
        enabled: true,
        appearance: "freakyFishGuy",
        description: "There isn't anything that one might consider 'water' in hell, so who knows where this ocean-dweller came from or how it got here.",
        texture: "46_aquaticman.png",
        npc: {
            adjective: "mad",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "dodge"
                }
            }
        }
    }),
    glassSpider: validatedCreature({
        name: "Glass Spider",
        traits: ["teleportingHunter"],
        enabled: true,
        appearance: "glassSpider",
        texture: "126_ghost_spider.png",
        description: "A strange spider able to blink in and out of reality to pounce upon prey.",
        npc: {

            adjective: "devious",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    }),
    goblinPariah: validatedCreature({
        name: "Goblin Pariah",
        traits: ["outcastStrength"],
        enabled: true,
        appearance: "goblinPariah",
        description: "A goblin filled with hatred for the people that cast him out.",
        texture: "21_goblin.png",
        npc: {
            loyalty: "alsharu",
            adjective: "devious",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "dodge"
                }
            }
        }
    }),
    hellfireSpirit: validatedCreature({
        name: "Wildfire Spirit",
        traits: ["consumingFlames"],
        enabled: true,
        appearance: "hellfireSpirit",
        texture: "26_fire_elemental.png",
        description: "A Demon representing the uncontrollable destruction of a wildfire.",
        npc: {
            loyalty: "waru",
            adjective: "underhanded",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "none"
                }
            }
        }
    }),
    inverseMan: validatedCreature({
        name: "Inverse Man",
        traits: ["inverted"],
        enabled: true,
        appearance: "inverseMan",
        texture: "47_dwarf.png",
        description: "He dug too greedily, and too deep.",
        npc: {
            loyalty: "aterradora",
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "block"
                }
            }
        }
    }),
    madOrc: validatedCreature({
        name: "Insane Orc",
        traits: ["fortressOfMadness"],
        enabled: true,
        appearance: "madOrc",
        description: "An orc warrior driven mad by a thirst for blood.",
        texture: "19_orc.png",
        npc: {
            loyalty: "kakoi",
            adjective: "mad",
            tactics: {
                default: {
                    offensive: "overwhelm",
                    defensive: "none"
                }
            }
        }
    }),
    monstrousTroll: validatedCreature({
        name: "Monstrous Troll",
        traits: ["atavisticConsumption"],
        enabled: true,
        appearance: "monstrousTroll",
        texture: "27_troll.png",
        description: "A Demon filled with such an insatiable hunger that it won't let itself die in the face of food.",
        npc: {
            loyalty: "kakoi",
            adjective: "mad",
            tactics: {
                default: {
                    offensive: "overwhelm",
                    defensive: "block"
                }
            }
        }
    }),
    myrmidonWarrior: validatedCreature({
        name: "Myrmidon",
        traits: ["relentless"],
        enabled: true,
        appearance: "myrmidonWarrior",
        description: "A warrior of an ant-like people, seeing all around them as enemies of it's ancient hive.",
        texture: "14_ant.png",
        npc: {
            loyalty: "none",
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "block"
                }
            }
        }
    }),
    plagueRat: validatedCreature({
        name: "Plague Rat",
        traits: ["plagueHarbinger"],
        enabled: true,
        appearance: "plagueRat",
        texture: "28_rat.png",
        description: "An embodiment of pestilence",
        npc: {
            loyalty: "waru",
            adjective: "underhanded",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    }),
    rapaciousHighwayman: validatedCreature({
        name: "Rapacious Highwayman",
        traits: ["cupidity"],
        enabled: false,
        appearance: "rapaciousHighwayman",
        texture: "02_hunter.png",
        description: "A thief who stole from whomever he could get away with, from wealthy merchants to starving vagrants.",
        npc: {
            loyalty: "kakoi",
            adjective: "devious",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    }),
    scorpion: validatedCreature({
        name: "Scorpion",
        traits: ["killingBlow"],
        enabled: true,
        appearance: "scorpion",
        description: "A deadly scorpion which injects burning venom via its massive stinger.",
        texture: "16_scorpion.png",
        npc: {
            loyalty: "kakoi",
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "block"
                }
            }
        }
    }),
    sanguineLord: validatedCreature({
        name: "Sinister Lord",
        traits: ["bloodHunger"],
        enabled: true,
        appearance: "sanguineLord",
        texture: "30_vampire.png",
        description: "A damned nobleman who survived for centuries by consuming the blood of the innocent, until slain by a righteous hunter",
        npc: {
            loyalty: "waru",
            adjective: "underhanded",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    }),
    searingFangViper: validatedCreature({
        name: "Searing-Fang Viper",
        traits: ["searingVenom"],
        enabled: true,
        appearance: "searingFangViper",
        texture: "07_snake_02.png",
        description: "A striking snake, whose venom inflicts horrific agony to its victims.",
        npc: {
            loyalty: "aterradora",
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    }),
    shadowHulk: validatedCreature({
        name: "Shadow Hulk",
        traits: ["shadowHulk"],
        enabled: true,
        appearance: "shadowHulk",
        texture: "38_wolf.png",
        description: "A massive <em>something</em> shrouded in darkness.",
        npc: {
            loyalty: "kakoi",
            adjective: "savage",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    }),
    skeletonHunter: validatedCreature({
        name: "Skeleton Hunter",
        traits: ["boneHunter"],
        enabled: true,
        appearance: "skeletonHunter",
        texture: "123_skeleton_archer.png",
        description: "A hunter who's body gave out before his will to catch his prey.",
        npc: {
            loyalty: "alsharu",
            adjective: "devious",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    }),
    skeletonMage: validatedCreature({
        name: "Skeleton Mage",
        traits: ["boneMagic"],
        enabled: true,
        appearance: "skeletonMage",
        texture: "124_burning_skeleton.png",
        description: "A mage who has given up their flesh",
        npc: {
            loyalty: "kakoi",
            adjective: "mad",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "block"
                }
            }
        }
    }),
    skitteringHorror: validatedCreature({
        name: "Skittering Horror",
        traits: ["terrifyingSkitter"],
        enabled: true,
        appearance: "skitteringHorror",
        texture: "10_spider.png",
        description: "A massive spider that enjoys stalking its prey, frightening it by the sickening skittering of it's arachnid legs.",
        npc: {
            loyalty: "kakoi",
            adjective: "mad",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    }),
    tempestSpirit: validatedCreature({
        name: "Tempest Spirit",
        traits: ["stormyPersonality"],
        enabled: true,
        description: "An embodiment of deadly weather, such as tornadoes, lightning and hail.",
        appearance: "tempestSpirit",
        texture: "24_air_elemental.png",
        npc: {
            loyalty: "alsharu",
            adjective: "devious",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    }),
    tormentedDead: validatedCreature({
        name: "Tormented Dead",
        traits: ["sharedPain"],
        enabled: true,
        appearance: "tormentedDead",
        texture: "29_zombie.png",
        description: "A human denied eternal rest and in agony from its ruined flesh.",
        npc: {
            loyalty: "kakoi",
            adjective: "mad",
            tactics: {
                default: {
                    offensive: "attrit",
                    defensive: "none"
                }
            }
        }
    }),
    wheezingApparition: validatedCreature({
        name: "Wheezing Apparition",
        enabled: false,
        traits: ["exhaustingTouch"],
        appearance: "wheezingApparition",
        texture: "128_sorrowsworn.png",
        description: "A soul of someone killed by strangulation, searching endlessly for victims upon which it can inflict the same fate.",
        npc: {
            loyalty: "alsharu",
            adjective: "devious",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    }),
    wretchedSkull: validatedCreature({
        name: "Wretched Skull",
        traits: ["cannonBall"],
        enabled: true,
        appearance: "wretchedSkull",
        texture: "32_flying_skull.png",
        description: "Combines your two favorite things: skulls and flying.",
        npc: {
            loyalty: "kakoi",
            adjective: "mad",
            tactics: {
                default: {
                    offensive: "counter",
                    defensive: "dodge"
                }
            }
        }
    })
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
        name: "Savage",
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

function validatedCreature(definition) {
    const validationResult = creatureValidator.validate(definition);
    if(validationResult.error) {
        throw new Error(validationResult.error);
    }
    return validationResult.value;
}