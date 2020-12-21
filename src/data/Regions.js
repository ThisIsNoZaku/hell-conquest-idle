import * as _ from "lodash";
import {generateCreature, getGlobalState} from "../engine";
import {config} from "../config";
import Big from "big.js";
import {debugMessage} from "../debugging";

class Region {
    constructor(name, available, encounters, background) {
        this.name = name;
        this.encounters = encounters;
        this.background = background;
    }

    startEncounter(player, rng) {
        const minimumLevel = _.get(getGlobalState(), ["debug", "encounters", "minLevel"], Big(1)); // FIXME
        const maximumLevel = _.get(getGlobalState(), ["debug", "encounters", "maxLevel"], player.powerLevel.plus(config.encounters.greaterLevelScale * 2));
        if(config.debug) {
            debugMessage(`Generating an encounter between ${minimumLevel.toFixed()} and ${maximumLevel.toFixed()} `);
        }
        const encounterLevelModifier = minimumLevel.toNumber() + Math.floor(rng.double() * (maximumLevel.toNumber() - minimumLevel.toNumber()));
        const encounterLevel = Big(Math.max(1, encounterLevelModifier));
        if(config.debug) {
            debugMessage(`Generated encounter level is ${encounterLevel}`);
        }
        const encounterDef = chooseRandomEncounter(this);
        if(encounterDef === undefined) {
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
        const encounterEnabled = region.encounters[encounterId].enabled !== false;
        const debugNotDisabled = _.get(getGlobalState(), ["debug", "regions", region.id, "encounters", encounterId]) !== false;
        return  encounterEnabled && debugNotDisabled;
    });
    const randomKey = possibleEncounters[Math.floor(Math.random() * Object.keys(region.encounters).length)];
    return region.encounters[randomKey];
}