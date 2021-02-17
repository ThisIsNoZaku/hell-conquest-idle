import * as _ from "lodash";
import {evaluateExpression, generateCreature, getCharacter, getGlobalState} from "../engine";
import {getConfigurationValue} from "../config";
import {debugMessage} from "../debugging";
import {Decimal} from "decimal.js";

class Region {
    constructor(id, name, available, description, encounters, background) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.available = available;
        this.encounters = encounters;
        this.background = background;
    }

    startEncounter(player, rng) {
        let encounterLevel = player.powerLevel;

        switch (getGlobalState().currentAction) {
            case "usurp": {
                encounterLevel = encounterLevel.plus(1);
                break;
            }
            case "hunting": {
                const encounterOffset = getConfigurationValue("lesser_level_scale");
                encounterLevel = Decimal.max(1, encounterLevel.minus(encounterOffset));
                break;
            }
            default: {
                const encounterOffset = 0
                encounterLevel = Decimal.max(1, encounterLevel.plus(encounterOffset));
            }
        }
        const encounterWithRival = getGlobalState().rivals[encounterLevel.toNumber()] !== undefined;
        if (getConfigurationValue("debug")) {
            debugMessage(`Generated encounter level is ${encounterLevel}`);
        }
        const rivalType = _.get(getGlobalState().rivals, [encounterLevel.toNumber(), "character", "appearance"]);
        const encounterDef = encounterWithRival ? this.encounters[rivalType] : chooseRandomEncounter(this);
        if (encounterWithRival) {
            const tactics = _.get(getGlobalState().rivals, [encounterLevel.toNumber(), "tactics"]);
            getCharacter(0).tactics = tactics;
        }
        if (encounterDef === undefined) {
            throw new Error("No encounter selected");
        }
        const encounter = {
            encounterLevel,
            ...encounterDef,
            currentTick: 0,
            pendingActions: [],
            enemies: encounterDef.enemies.flatMap(enemyDef => _.range(0, enemyDef.count).map(i => {
                const generatedCreature = generateCreature(enemyDef.name, encounterLevel, rng);
                generatedCreature.isRival = encounterWithRival;
                if (generatedCreature.isRival) {
                    debugger;
                    generatedCreature.traits = getGlobalState().rivals[encounterLevel.toNumber()].character.traits;
                    generatedCreature.tactics = getGlobalState().rivals[encounterLevel.toNumber()].character.tactics;
                }
                return generatedCreature;
            }))
        };
        return encounter;
    }
}

export const Regions = {
    forest: new Region("forest", "The Prey's Lament",
        true,
        "An unending thick tangled forest, teeming with vicious predators. Filled with the souls of torturers and other sadists, victims of this hell are repeatedly hunted down, ripped apart and eaten",
        {
            bees: {
                description: "1 Bees",
                type: "combat",
                enemies: [
                    {
                        name: "bees",
                        count: 1
                    }
                ]
            },
            bloodthirstyKnight: {
                description: "1 Bloodthirsty Knight",
                type: "combat",
                enemies: [
                    {
                        name: "bloodthirstyKnight",
                        count: 1
                    }
                ]
            },
            rapaciousHighwayman: {
                description: "1 Rapacious Highwayman",
                type: "combat",
                enabled: false,
                enemies: [
                    {
                        name: "rapaciousHighwayman",
                        count: 1
                    }
                ]
            },
            condemnedSlasher: {
                description: "1 Condemned Slasher",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "condemnedSlasher",
                        count: 1
                    }
                ]
            },
            crushingSnake: {
                description: "1 Crushing Snake",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "crushingSnake",
                        count: 1
                    }
                ]
            },
            deadlyHornet: {
                description: "1 Deadly Hornet",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "deadlyHornet",
                        count: 1
                    }
                ]
            },
            monstrousTroll: {
                description: "1 Myrmidon Warrior",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "monstrousTroll",
                        count: 1
                    }
                ]
            },
            searingFangViper: {
                description: "1 Searing Fang",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "searingFangViper",
                        count: 1,
                    }
                ]
            },

            scorpion: {
                description: "1 Scorpion",
                enabled: true,
                enemies: [
                    {
                        name: "scorpion",
                        count: 1
                    }
                ]
            },
            shadowHulk: {
                description: "1 Scorpion",
                enabled: true,
                enemies: [
                    {
                        name: "shadowHulk",
                        count: 1
                    }
                ]
            },
            fleshlessSoldier: {
                description: "1 Fleshless Soldier",
                enabled: true,
                enemies: [
                    {
                        name: "fleshlessSoldier",
                        count: 1
                    }
                ]
            },
            madOrc: {
                description: "1 Mad Orc",
                enabled: true,
                enemies: [
                    {
                        name: "madOrc",
                        count: 1
                    }
                ]
            },
            skeletonHunter: {
                description: "1 Scorpion",
                enabled: true,
                enemies: [
                    {
                        name: "skeletonHunter",
                        count: 1
                    }
                ]
            },
        },
        {
            background: "./backgrounds/Forest bg.png",
            far: "./backgrounds/Forest trees far.png",
            mid: "./backgrounds/Forest trees mid.png",
            close: "./backgrounds/Forest trees close.png"
        }
    ),
    caves: new Region("caves", "The Bottomless Caverns",
        true,
        "An endless series of winding caves and caverns, utterly without illumination. Souls here are doomed to stumble for eternity, catching their limbs in crevasses and stumbling upon hidden terrors.",
        {
            bloodyBat: {
                description: "1 Carrion Beetle",
                enabled: true,
                enemies: [
                    {
                        name: "bloodyBat",
                        count: 1
                    }
                ]
            },
            carrionBeetle: {
                description: "1 Carrion Beetle",
                enabled: true,
                enemies: [
                    {
                        name: "carrionBeetle",
                        count: 1
                    }
                ]
            },
            creeperPeeper: {
                description: "1 Carrion Beetle",
                enabled: true,
                enemies: [
                    {
                        name: "creeperPeeper",
                        count: 1
                    }
                ]
            },
            demonSummoner: {
                description: "1 Carrion Beetle",
                enabled: true,
                enemies: [
                    {
                        name: "demonSummoner",
                        count: 1
                    }
                ]
            },
            glassSpider: {
                description: "1 Carrion Beetle",
                enabled: true,
                enemies: [
                    {
                        name: "glassSpider",
                        count: 1
                    }
                ]
            },
            inverseMan: {
                description: "1 Carrion Beetle",
                enabled: true,
                enemies: [
                    {
                        name: "inverseMan",
                        count: 1
                    }
                ]
            },
            myrmidonWarrior: {
                description: "1 Myrmidon Warrior",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "myrmidonWarrior",
                        count: 1
                    }
                ]
            },
            sanguineLord: {
                description: "1 Skittering Horror",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "sanguineLord",
                        count: 1
                    }
                ]
            },
            skitteringHorror: {
                description: "1 Skittering Horror",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "skitteringHorror",
                        count: 1
                    }
                ]
            },
            wheezingApparition: {
                description: "1 Skittering Horror",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "wheezingApparition",
                        count: 1
                    }
                ]
            },
        },
        {
            background: "./backgrounds/cave01_bg.png",
            far: "./backgrounds/cave01_rocksFar.png",
            mid: "./backgrounds/cave01_rocksMid.png",
            close: "./backgrounds/cave01_rocksClose.png"
        }),
    mountains: new Region("mountains", "The Crags of Futility",
        true,
        " Each mountain within the crags is a mountain hundred of thousands of miles high topped by portals which allow escape from hell and littered with barriers and impediments that seek to throw climbers back to the bottom of the mountain.",
        {
            demonLord: {
                description: "1 Bloody Bat",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "demonLord",
                        count: 1,
                    }
                ]
            },
            eerieHierophant: {
                description: "1 Bloody Bat",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "eerieHierophant",
                        count: 1,
                    }
                ]
            },
            eyeBeast: {
                description: "1 Bloody Bat",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "eyeBeast",
                        count: 1,
                    }
                ]
            },
            fleshlessSoldier: {
                description: "1 Bloody Bat",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "fleshlessSoldier",
                        count: 1,
                    }
                ]
            },
            freakyFishGuy: {
                description: "1 Bloody Bat",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "freakyFishGuy",
                        count: 1,
                    }
                ]
            },
            goblinPariah: {
                description: "1 Bloody Bat",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "goblinPariah",
                        count: 1,
                    }
                ]
            },
            plagueRat: {
                description: "1 Bloody Bat",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "plagueRat",
                        count: 1,
                    }
                ]
            },
            tempestSpirit: {
                description: "1 Bloody Bat",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "tempestSpirit",
                        count: 1,
                    }
                ]
            },
        },
        {
            background: "./backgrounds/mountains bg.png",
            far: "./backgrounds/mountains far.png",
            mid: "./backgrounds/mountains mid.png",
            close: "./backgrounds/mountains close.png"
        }),
    desert: new Region("desert", "The Desert of Isolation",
        true,
        "The desert extends to the horizon in every direction. From every point within the desert, an oasis can be seen. Anyone able to stumble for hours, their flesh scorched by the sun and their feet by the hot sand, to reach the oasis finds muddy, foul tasting water of such a small quantity that it seems to accentuate rather than slake their thirst.",
        {
            bandagedMan: {
                description: "1 Bloody Bat",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "bandagedMan",
                        count: 1,
                    }
                ]
            },
            bigCrap: {
                description: "1 Bloodthirsty Knight",
                type: "combat",
                enemies: [
                    {
                        name: "bigCrab",
                        count: 1
                    }
                ]
            },
            bitingLizard: {
                description: "1 Bloodthirsty Knight",
                type: "combat",
                enemies: [
                    {
                        name: "bitingLizard",
                        count: 1
                    }
                ]
            },
            fireHawk: {
                description: "1 Bloodthirsty Knight",
                type: "combat",
                enemies: [
                    {
                        name: "fireHawk",
                        count: 1
                    }
                ]
            },
            hellfireSpirit: {
                description: "1 Bloodthirsty Knight",
                type: "combat",
                enemies: [
                    {
                        name: "hellfireSpirit",
                        count: 1
                    }
                ]
            },
            skeletonMage: {
                description: "1 Bloodthirsty Knight",
                type: "combat",
                enemies: [
                    {
                        name: "skeletonMage",
                        count: 1
                    }
                ]
            },
            tormentedDead: {
                description: "1 Tormented Dead",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "tormentedDead",
                        count: 1
                    }
                ]
            },
            wretchedSkull: {
                description: "1 Tormented Dead",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "wretchedSkull",
                        count: 1
                    }
                ]
            },
        },
        {
            background: "./backgrounds/desert bg.png",
            far: "./backgrounds/dunes far.png",
            mid: "./backgrounds/dunes mid.png",
            close: "./backgrounds/dunes close.png"
        })
}

function chooseRandomEncounter(region) {
    const possibleEncounters = Object.keys(region.encounters).filter(encounterId => {
        debugMessage(`Determining if '${encounterId}' is enabled.`);
        const encounterEnabled = region.encounters[encounterId].enabled !== false;
        if (!encounterEnabled) {
            debugMessage(`Encounter '${encounterId}' disabled`);
        }
        const debugNotDisabled = _.get(getGlobalState(), ["debug", "regions", region.id, "encounters", encounterId, "enabled"]) !== false;
        if (!debugNotDisabled) {
            debugMessage(`Encounter '${encounterId}' disabled by debug.`);
        }
        return encounterEnabled && debugNotDisabled;
    });
    const randomKey = possibleEncounters[Math.floor(Math.random() * Object.keys(possibleEncounters).length)];
    debugMessage(`Selected encounter '${randomKey}'`);
    return region.encounters[randomKey];
}