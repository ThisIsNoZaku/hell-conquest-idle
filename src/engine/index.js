import * as _ from "lodash";
import {assertCreatureExists, Creatures} from "../data/creatures";
import {debugMessage} from "../debugging";
import { Decimal } from "decimal.js";
import {Character} from "../character";
import {config} from "../config";
import * as Package from "../../package.json";
import {Tactics} from "../data/Tactics";
import changelog from "../changelog.json";
import pkg from "../../package.json";

export const saveKey = require("md5")(`hell-conquest-${Package.version}`);

const expressionCache = {};

let globalState = loadGlobalState()

export function getGlobalState() {
    return globalState;
}

export function saveGlobalState() {
    window.localStorage.setItem(saveKey, JSON.stringify(globalState));
}

export function loadGlobalState() {
    let loaded = window.localStorage.getItem(saveKey);
    if (!loaded) {
        // try to load previous versions
        const previousCompatibleVersions = changelog[pkg.version].compatiblePreviousVersions;
        if (previousCompatibleVersions) {
            loaded = previousCompatibleVersions.reduce((latestVersion, version) => {
                const nextKey = require("md5")(`hell-conquest-${version}`);
                return window.localStorage.getItem(nextKey) || latestVersion;
            }, null);
        }
    }
    return loaded ? JSON.parse(loaded, stateReviver) : {
        debug: {
            creatures: {},
            regions: {}
        },
        reincarnationCount: 0,
        passivePowerIncome: Decimal(0),
        unlockedMonsters: {},
        unlockedTraits: {},
        paused: true,
        currentAction: null,
        nextAction: null,
        id: 0,
        highestLevelReached: Decimal(1),
        startingTraits: {},
        currentEncounter: null,
        manualSpeedMultiplier: config.manualSpeedup.enabled ? config.manualSpeedup.multiplier : 1,
        currentRegion: "forest",
        actionLog: [],
        exploration: {
            explorationTime: 5 * 1000,
            approachTime: 5 * 1000,
            combatTime: 5 * 1000,
            lootingTime: 5 * 1000,
            recoveryTime: 2 * 1000,
            fleeingTime: 5 * 1000,
            intimidateTime: 5 * 1000,
            reincarnationTime: 1
        },
        characters: {
            0: new Character({
                id: 0,
                isPc: true,
                name: "You",
                powerLevel: Decimal(1),
                absorbedPower: Decimal(0),
                appearance: "",
                statuses: {},
                traits: {},
                tactics: "defensive",
                items: [],
                attributes: {
                    brutality: Decimal(0),
                    cunning: Decimal(0),
                    deceit: Decimal(0),
                    madness: Decimal(0)
                },
                combat: {
                    fatigue: 0,
                    minimumDamageMultiplier: .5,
                    medianDamageMultiplier: 1,
                    maximumDamageMultiplier: 1.5
                }
            })
        },
        tutorials: {}
    }
}

export function getCharacter(id) {
    assertCharacterExists(id);
    return globalState.characters[id];
}

let nextMonsterId = 1;

export function generateCreature(id, powerLevel, rng) {
    assertCreatureExists(id);
    if (config.debug) {
        debugMessage(`Generating creature with id ${id} and level ${powerLevel}`);
    }
    if (powerLevel === undefined) {
        throw new Error("No powerLevel");
    }
    if (Number.isNaN(powerLevel)) {
        throw new Error("Level cannot be NaN");
    }
    const tactics = Object.keys(Tactics)[Math.floor(rng.double() * 3)];
    const nextId = nextMonsterId++;
    globalState.characters[nextId] = new Character({
        id: nextId,
        ...Creatures[id],
        latentPower: Decimal(evaluateExpression(config.mechanics.reincarnation.latentPowerGainOnReincarnate, {
            player: {
                powerLevel: powerLevel.minus(1)
            }
        })),
        tactics,
        traits: Creatures[id].traits.reduce((traits, next) => {
            traits[next] = powerLevel.div(10).ceil();
            return traits;
        }, {}),
        absorbedPower: getPowerNeededForLevel(powerLevel),
        artifacts: [],
        statuses: {},
        attributes: {
            brutality: powerLevel.minus(1).floor(),
            cunning: powerLevel.minus(1).floor(),
            deceit: powerLevel.minus(1).floor(),
            madness: powerLevel.minus(1).floor(),
        },
        combat: {
            fatigue: 0,
            minimumDamageMultiplier: .5,
            medianDamageMultiplier: 1,
            maximumDamageMultiplier: 1.5
        }
    });
    saveGlobalState();
    return globalState.characters[nextId];
}


export function getSpriteForCreature(name) {
    assertCreatureExists(name);
    return `monsters/${Creatures[name].texture}`;
}

function assertCharacterExists(id) {
    if (!globalState.characters[id]) {
        throw new Error(`No creature exists for '${id}'`);
    }
}

export function evaluateExpression(expression, context) {
    if(expression === null || expression === undefined) {
        return expression;
    }
    if (!expressionCache[expression]) {
        expressionCache[expression] = new Function("context", `with(context) {return ${expression}}`);
    }
    context.Decimal = Decimal;
    context.config = config;
    return expressionCache[expression].call(null, context);
}

export function getPowerNeededForLevel(level) {
    return evaluateExpression(config.mechanics.levelToPowerEquation, {
        $level: Decimal(level)
    });
}

export function getLevelForPower(powerPoints) {
    return evaluateExpression(config.mechanics.powerToLevelEquation, {
        $powerPoints: Decimal(powerPoints)
    });
}

export function reincarnateAs(monsterId, newAttributes) {
    const player = getCharacter(0);
    // Improve your starting traits
    const currentDemon = Creatures[player.appearance];
    if (currentDemon) {
        currentDemon.traits.forEach(trait => {
            if (!globalState.unlockedTraits[trait] || player.powerLevel.gt(globalState.unlockedTraits[trait])) {
                globalState.unlockedTraits[trait] = player.powerLevel;
            }
        });
    }

    if(Decimal(globalState.highestLevelReached).lt(player.powerLevel)) {
        globalState.highestLevelReached = player.powerLevel;
    }

    if (monsterId === "random") {
        const options = _.difference(Object.keys(Creatures).filter(m => {
            return _.get(globalState, ["debug", "creatures", m, "enabled"], true) &&
                Creatures[m].enabled !== false
        }), Object.keys(globalState.unlockedMonsters)
            .filter(m => globalState.unlockedMonsters[m]));
        monsterId = options[Math.floor(Math.random() * options.length)];
    }

    // Update player attributes
    Object.keys(player.attributes).forEach(attribute => {
        player.attributes[attribute] = Decimal(newAttributes[attribute.substring(1)]);
    })
    if(globalState.reincarnationCount !== 0) {
        // Add your level to your starting energy.
        const latentPowerGain = evaluateExpression(config.mechanics.reincarnation.latentPowerGainOnReincarnate, {
            player
        });
        globalState.characters[0].latentPower = globalState.characters[0].latentPower.plus(latentPowerGain);
    }


    globalState.characters[0].absorbedPower = Decimal(0);
    globalState.characters[0].reincarnate(monsterId, globalState.startingTraits);
    globalState.unlockedMonsters[monsterId] = true;

    getCharacter(0).traits = Object.keys(globalState.startingTraits)
        .filter(t => globalState.startingTraits[t])
        .reduce((startingTraits, trait) => {
        startingTraits[trait] = globalState.unlockedTraits[trait];
        return startingTraits;
    }, {});
    Creatures[monsterId].traits.forEach(trait => {
        getCharacter(0).traits[trait] = 1;
    })

    globalState.currentEncounter = null;
    globalState.currentAction = "reincarnating";
    getCharacter(0).currentHp = getCharacter(0).maximumHp;
    getGlobalState().passivePowerIncome = Decimal(0);
    globalState.reincarnationCount++;

    saveGlobalState();
}

export function unpause() {
    globalState.paused = false;
}

function stateReviver(key, value) {
    switch (key) {
        case "characters":
            return Object.keys(value).reduce((characters, id) => {
                characters[id] = new Character(value[id]);
                return characters;
            }, {});
        case "enemies":
            return Object.keys(value).map(character => {
                return new Character(value[character]);
            });
        case "paused":
            return false;
        case "passivePowerIncome":
            return Decimal(value);
        case "value":
            const parsed = Number.parseFloat(value);
            if (Number.isNaN(parsed)) {
                return value;
            }
            return Decimal(value);
        default:
            return value;
    }
}

export function resetDebug() {
    globalState.debug.creatures = {};
    globalState.debug.regions = {};
}

export function getManualSpeedMultiplier() {
    const debugMultiplier = _.get(globalState, ["debug", "manualSpeedMultiplier"]);
    const baseMultiplier = globalState.manualSpeedMultiplier;
    return debugMultiplier || baseMultiplier;
}

export function clearGlobalState() {
    const previousCompatibleVersions = changelog[pkg.version].compatiblePreviousVersions;
    previousCompatibleVersions.forEach(version => window.localStorage.removeItem(require("md5")(`hell-conquest-${version}`)));
    window.localStorage.removeItem(require("md5")(`hell-conquest-${pkg.version}`));
    globalState = loadGlobalState()
}