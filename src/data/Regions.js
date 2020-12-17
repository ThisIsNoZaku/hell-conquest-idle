import * as _ from "lodash";
import {generateCreature} from "../engine";
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
        const minimumLevel = Math.max(1, player.powerLevel - config.encounters.lesserLevelScale * 2);
        const maximumLevel = player.powerLevel + config.encounters.greaterLevelScale * 2;
        if(config.debug) {
            debugMessage(`Generating an encounter between ${minimumLevel} and ${maximumLevel} `);
        }
        const encounterLevelModifier = minimumLevel + Math.floor(rng.double() * (maximumLevel - minimumLevel));
        const encounterLevel = Big(Math.max(1, encounterLevelModifier));
        if(config.debug) {
            debugMessage(`Generated encounter level is ${encounterLevel}`);
        }
        const encounterDef = chooseRandomEncounter(this.encounters);
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
                type: "combat",
                enemies: [
                    {
                        name: "bloodthirstyKnight",
                        count: 1
                    }
                ]
            },
            rapaciousHighwayman: {
                type: "combat",
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

function chooseRandomEncounter(encounters) {
    const randomKey = Object.keys(encounters)[Math.floor(Math.random() * Object.keys(encounters).length)];
    return encounters[randomKey];
}