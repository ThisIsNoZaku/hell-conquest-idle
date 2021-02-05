import * as _ from "lodash";
import {evaluateExpression, generateCreature, getGlobalState} from "../engine";
import {getConfigurationValue} from "../config";
import {debugMessage} from "../debugging";
import {Decimal} from "decimal.js";

class Region {
    constructor(id, name, available, encounters, background) {
        this.id = id;
        this.name = name;
        this.encounters = encounters;
        this.background = background;
    }

    startEncounter(player, rng) {
        let encounterLevel = player.powerLevel;

        switch (getGlobalState().currentAction) {
            case "usurp": {
                const encounterOffset = getConfigurationValue("greater_level_scale");
                encounterLevel = getGlobalState().rival.level ? Decimal.min(encounterLevel.plus(encounterOffset), Decimal(getGlobalState().rival.level).minus(1)) : encounterLevel.plus(encounterOffset);
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
        const encounterWithRival = getGlobalState().rival.powerLevel && Decimal(getGlobalState().rival.powerLevel || 0).lte(encounterLevel);
        if (encounterWithRival) {
            encounterLevel = Decimal(getGlobalState().rival.powerLevel);
        }
        if (getConfigurationValue("debug")) {
            debugMessage(`Generated encounter level is ${encounterLevel}`);
        }
        const rivalType = getGlobalState().rival.appearance;
        const encounterDef = encounterWithRival ? this.encounters[rivalType] : chooseRandomEncounter(this);
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
                    generatedCreature.traits = getGlobalState().rival.traits;
                    generatedCreature.tactics = getGlobalState().rival.tactics;
                }
                return generatedCreature;
            }))
        };
        return encounter;
    }
}

export const Regions = {
    forest: new Region("forest","The Prey's Lament", true, {
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
            bloodyBat: {
                description: "1 Bloody Bat",
                type: "combat",
                enabled: true,
                enemies: [
                    {
                        name: "bloodyBat",
                        count: 1,
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
            }
        },
        {
            background: "backgrounds/parallax-demon-woods-bg.png",
            far: "backgrounds/parallax-demon-woods-far-trees.png",
            mid: "backgrounds/parallax-demon-woods-mid-trees.png",
            close: "backgrounds/parallax-demon-woods-close-trees.png"
        }
    ),
    caves: new Region("The Bottomless Caverns", false, {}, {}),
    mountains: new Region("The Crags of Futility", false, {}, {}),
    desert: new Region("The Desert of Isolation", false, {}, {})
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