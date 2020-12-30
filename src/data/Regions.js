import * as _ from "lodash";
import {generateCreature, getGlobalState} from "../engine";
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
        const minimumLevel = _.get(getGlobalState(), ["debug", "encounters", "minLevel"], player.powerLevel.minus(config.encounters.lesserLevelScale * 2));
        const candidateMaxLevel = _.get(getGlobalState(), ["debug", "encounters", "maxLevel"],
            player.powerLevel.plus(config.encounters.greaterLevelScale * 2));
        const maximumLevel = candidateMaxLevel.gte(config.mechanics.maxLevel) ? Decimal(config.mechanics.maxLevel - 1) : candidateMaxLevel;

        if (config.debug) {
            debugMessage(`Generating an encounter between ${minimumLevel.toFixed()} and ${maximumLevel.toFixed()} `);
        }
        const encounterLevelModifier = minimumLevel.toNumber() + Math.floor(rng.double() * (maximumLevel.toNumber() - minimumLevel.toNumber()));
        const encounterLevel = Decimal(Math.max(1, encounterLevelModifier));
        if (config.debug) {
            debugMessage(`Generated encounter level is ${encounterLevel}`);
        }
        const encounterDef = chooseRandomEncounter(this);
        if (encounterDef === undefined) {
            throw new Error("No encounter selected");
        }
        const encounter = {
            encounterLevel,
            ...encounterDef,
            pendingActions: [],
            enemies: encounterDef.enemies.flatMap(enemyDef => _.range(0, enemyDef.count).map(i => {
                return generateCreature(enemyDef.name, encounterLevel, rng)
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
            crushingSnake: {
                description: "1 Crushing Snake",
                type: "combat",
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
                enemies: [
                    {
                        name: "deadlyHornet",
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