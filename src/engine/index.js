import * as _ from "lodash";
import {assertCreatureExists, Creatures} from "../data/creatures";
import {debugMessage} from "../debugging";
import { Decimal } from "decimal.js";
import {Character} from "../character";
import {config} from "../config";
import * as Package from "../../package.json";

export const saveKey = require("md5")(`hell-conquest-${Package.version}`);

const expressionCache = {};

let globalState = loadGlobalState()

export function getGlobalState() {
    return globalState;
}

export function saveGlobalState() {
    window.localStorage.setItem(saveKey, JSON.stringify(globalState));
}

export function loadGlobalState(state) {
    const loaded = window.localStorage.getItem(saveKey);
    return loaded ? JSON.parse(loaded, stateReviver) : {
        debug: {
            creatures: {},
            regions: {}
        },
        passivePowerIncome: Decimal(0),
        unlockedMonsters: {},
        unlockedTraits: {},
        paused: true,
        currentAction: null,
        nextAction: null,
        id: 0,
        highestLevelReached: Decimal(0),
        startingTraits: {},
        currentEncounter: null,
        manualSpeedMultiplier: config.manualSpeedup.multiplier,
        currentRegion: "forest",
        actionLog: [],
        exploration: {
            explorationTime: 15 * 1000,
            approachTime: 15 * 1000,
            combatTime: 5 * 1000,
            lootingTime: 15 * 1000,
            recoveryTime: 2 * 1000,
            fleeingTime: 15 * 1000,
            intimidateTime: 15 * 1000,
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
    const nextId = nextMonsterId++;
    globalState.characters[nextId] = new Character({
        id: nextId,
        ...Creatures[id],
        latentPower: evaluateExpression(config.mechanics.latentPowerGainOnReincarnate, {
            player: {
                powerLevel
            }
        }).times(5),
        traits: Creatures[id].traits.reduce((traits, next) => {
            traits[next] = powerLevel;
            return traits;
        }, {}),
        absorbedPower: getPowerNeededForLevel(powerLevel),
        artifacts: [],
        statuses: [],
        attributes: {
            brutality: powerLevel.div(2).floor(),
            cunning: powerLevel.div(2).floor(),
            deceit: powerLevel.div(2).floor(),
            madness: powerLevel.div(2).floor(),
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

    // Add your level to your starting energy.
    const latentPowerGain = evaluateExpression(config.mechanics.latentPowerGainOnReincarnate, {
        player
    })
    globalState.characters[0].latentPower = globalState.characters[0].latentPower.plus(latentPowerGain);
    globalState.characters[0].absorbedPower = Decimal(0);
    globalState.characters[0].reincarnate(monsterId, globalState.startingTraits);
    globalState.unlockedMonsters[monsterId] = true;

    getCharacter(0).traits = Object.keys(globalState.startingTraits).reduce((startingTraits, trait) => {
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