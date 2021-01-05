import * as _ from "lodash";
import {evaluateExpression, generateCreature, getGlobalState} from "../engine";
import {config} from "../config";
import {debugMessage} from "../debugging";
import {Decimal} from "decimal.js";

class Region {
    constructor(name, available, encounters, background) {
        this.name = name;
        this.encounters = encounters;
        this.background = background;
    }

    startEncounter(player, rng) {
        let encounterType;
        const combinedEncounterChances = config.encounters.lesserEncounterChanceWeight +
            config.encounters.greaterEncounterChanceWeight +
            config.encounters.evenEncounterChanceWeight;
        const encounterTypeRoll = Math.floor(rng.double() * combinedEncounterChances) + 1;
        const lesserChance = config.encounters.lesserEncounterChanceWeight;
        const evenChance = config.encounters.lesserEncounterChanceWeight + config.encounters.evenEncounterChanceWeight;
        let encounterLevel = player.powerLevel;
        debugMessage(`Determine encounter. Roll ${encounterTypeRoll} vs lesser (<=${lesserChance}), even (<=${evenChance})`);
        if (encounterTypeRoll <= lesserChance) {
            encounterType = "lesser";
            debugMessage(`Lesser triggered`)
        } else if (encounterTypeRoll <= evenChance) {
            encounterType = "even";
            debugMessage(`Even level encounter triggered`);
        } else {
            encounterType = "greater";
            debugMessage(`Greater encounter triggered`);
        }

        switch (encounterType) {
            case "greater": {
                const encounterOffset = Math.floor(rng.double() * config.encounters.greaterLevelCap) + config.encounters.greaterLevelScale;
                encounterLevel = getGlobalState().rival.level ? Decimal.min(encounterLevel.plus(encounterOffset), Decimal(getGlobalState().rival.level).minus(1) ) : encounterLevel.plus(encounterOffset);
                break;
            }
            case "lesser": {
                const encounterOffset = Math.floor(rng.double() * config.encounters.lesserLevelFloor) + config.encounters.lesserLevelScale;
                encounterLevel = Decimal.max(1, encounterLevel.minus(encounterOffset));
                break;
            }
            default: {
                const difference = Math.max(config.encounters.greaterLevelScale, config.encounters.lesserLevelScale) - Math.min(config.encounters.greaterLevelScale, config.encounters.lesserLevelScale);
                const encounterOffset = Math.floor(rng.double() * difference) - difference;
                encounterLevel = Decimal.max(1, encounterLevel.plus(encounterOffset));
            }
        }
        const encounterWithRival = Decimal(getGlobalState().rival.level || 0).eq(encounterLevel);
        if (config.debug) {
            debugMessage(`Generated encounter level is ${encounterLevel}`);
        }
        const encounterDef = encounterWithRival ? this.encounters[getGlobalState().rival.type] : chooseRandomEncounter(this);
        if (encounterDef === undefined) {
            throw new Error("No encounter selected");
        }
        const encounter = {
            encounterLevel,
            ...encounterDef,
            pendingActions: [],
            enemies: encounterDef.enemies.flatMap(enemyDef => _.range(0, enemyDef.count).map(i => {
                const generatedCreature = generateCreature(enemyDef.name, encounterLevel, rng);
                generatedCreature.isRival = encounterWithRival;
                if(generatedCreature.isRival) {
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
    forest: new Region("The Prey's Lament", true, {
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
        const debugNotDisabled = _.get(getGlobalState(), ["debug", "regions", region.id, "encounters", encounterId]) !== false;
        if (!debugNotDisabled) {
            debugMessage(`Encounter '${encounterId}' disabled by debug.`);
        }
        return encounterEnabled && debugNotDisabled;
    });
    const randomKey = possibleEncounters[Math.floor(Math.random() * Object.keys(possibleEncounters).length)];
    debugMessage(`Selected encounter '${randomKey}'`);
    return region.encounters[randomKey];
}