import * as _ from "lodash";
import {assertCreatureExists, Creatures, titles} from "../data/creatures";
import {debugMessage} from "../debugging";
import {Decimal} from "decimal.js";
import {Character} from "../character";
import {config} from "../config";
import * as Package from "../../package.json";
import {Tactics} from "../data/Tactics";
import changelog from "../changelog.json";
import pkg from "../../package.json";
import { knuthShuffle } from "knuth-shuffle";
import evaluateExpression from "./general/evaluateExpression";
import getPowerNeededForLevel from "./general/getPowerNeededForLevel";

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
        events: [],
        debug: {
            creatures: {},
            regions: {}
        },
        rival: {},
        intimidatedDemons: {},
        reincarnationCount: 0,
        latentPowerCap: 0,
        passivePowerIncome: Decimal(0),
        unlockedMonsters: {},
        unlockedTraits: {},
        paused: true,
        currentAction: null,
        nextAction: "challenging",
        id: 0,
        highestLevelEnemyDefeated: 0,
        startingTraits: {},
        currentEncounter: null,
        manualSpeedMultiplier: config.manualSpeedup.enabled ? config.manualSpeedup.multiplier : 1,
        currentRegion: "forest",
        actionLog: [],
        exploration: {
            explorationTime: 2.5 * 1000,
            approachTime: 5 * 1000,
            combatTime: 5 * 1000,
            lootingTime: 5 * 1000,
            recoveryTime: 2 * 1000,
            fleeingTime: 5 * 1000,
            intimidateTime: 2.5 * 1000,
            reincarnationTime: 30 * 1000
        },
        characters: {
            0: new Character({
                highestLevelReached: Decimal(1),
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
                    brutality: Decimal(config.mechanics.combat.playerAttributeMinimum),
                    cunning: Decimal(config.mechanics.combat.playerAttributeMinimum),
                    deceit: Decimal(config.mechanics.combat.playerAttributeMinimum),
                    madness: Decimal(config.mechanics.combat.playerAttributeMinimum)
                },
                combat: {
                    fatigue: 0,
                    minimumDamageMultiplier: .5,
                    medianDamageMultiplier: 1,
                    maximumDamageMultiplier: 1.5
                }
            })
        },
        tutorials: {
            reincarnation: {
                enabled: true
            }
        }
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
    // Bonus traits
    const numberOfBonusTraits = powerLevel.div(20).floor();
    const startingTraits = Creatures[id].traits.reduce((traits, next) => {
        traits[next] = powerLevel.div(10).ceil();
        return traits;
    }, {});
    const alreadySelected = [id];
    for(let i = 0; i < numberOfBonusTraits; i++) {
        const options = Object.keys(Creatures).filter(x => !alreadySelected.includes(x));
        const index = rng.double() * options.length;
        const selectedCreature = Creatures[options[index]];
        selectedCreature.traits.forEach(trait => {
            startingTraits[trait] = powerLevel.div(10).minus(1).ceil();
        })
    }
    // Adjectives
    const options = Object.keys(titles);
    const index = Math.floor(options.length * rng.double());
    const adjective = titles[options[index]];
    const bonuses = calculateNPCBonuses(Decimal(powerLevel).toNumber() * 2, [adjective]);
    globalState.characters[nextId] = new Character({
        id: nextId,
        ...Creatures[id],
        latentPower: 0,
        stolenPower: powerLevel.div(4),
        tactics,
        adjectives: [adjective],
        traits: startingTraits,
        absorbedPower: getPowerNeededForLevel(powerLevel),
        artifacts: [],
        statuses: {},
        attributes: {
            brutality: bonuses.attributes.brutality,
            cunning:bonuses.attributes.cunning,
            deceit:bonuses.attributes.deceit,
            madness:bonuses.attributes.madness
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

    if (Decimal(getCharacter(0).highestLevelReached).lt(player.powerLevel)) {
        getCharacter(0).highestLevelReached = player.powerLevel;
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
    if (globalState.reincarnationCount !== 0) {
        // Calculate your new latent power cap
        globalState.latentPowerCap = evaluateExpression(config.mechanics.reincarnation.latentPowerCap, {
            highestLevelEnemyDefeated: Decimal(globalState.highestLevelEnemyDefeated)
        })
        // Add your level to your starting energy.
        const latentPowerGain = evaluateExpression(config.mechanics.reincarnation.latentPowerGainOnReincarnate, {
            player
        });
        globalState.characters[0].latentPower = Decimal.min(
            evaluateExpression(config.mechanics.reincarnation.latentPowerCap, {
                player,
                highestLevelEnemyDefeated: Decimal(globalState.highestLevelEnemyDefeated)
            }),
            globalState.characters[0].latentPower.plus(latentPowerGain));
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
    getCharacter(0).currentHp = getCharacter(0).maximumHp;
    getGlobalState().actionLog = [];
    getGlobalState().passivePowerIncome = Decimal(0);
    globalState.reincarnationCount++;
    getGlobalState().currentAction = "exploring";

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
        case "automaticReincarnate":
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
    const previousCompatibleVersions = changelog[pkg.version].compatiblePreviousVersions || [];
    previousCompatibleVersions.forEach(version => window.localStorage.removeItem(require("md5")(`hell-conquest-${version}`)));
    window.localStorage.removeItem(require("md5")(`hell-conquest-${pkg.version}`));
    globalState = loadGlobalState()
}

function calculateNPCBonuses(points, adjectives) {
    const attributeWeights = {
        brutality: _.sum(adjectives.map(a => a.attributeMultipliers.brutality)),
        cunning: _.sum(adjectives.map(a => a.attributeMultipliers.cunning)),
        deceit: _.sum(adjectives.map(a => a.attributeMultipliers.deceit)),
        madness: _.sum(adjectives.map(a => a.attributeMultipliers.madness))
    };

    const pointsAssigned = {
        brutality: 0,
        cunning: 0,
        deceit: 0,
        madness: 0
    }

    const attributeOrder = knuthShuffle(Object.keys(attributeWeights));

    while (points > 0) {
        const highestWeight = attributeOrder.reduce((highestWeight, next) => {
            const adjustedWeightOfHighest = attributeWeights[highestWeight]/(1 + pointsAssigned[highestWeight]);
            const adjustedWeightOfNext = attributeWeights[next]/(1 + pointsAssigned[next]);
            return adjustedWeightOfHighest >= adjustedWeightOfNext ? highestWeight : next;
        }, "brutality");
        pointsAssigned[highestWeight]++;
        points--;
    }

    return {
        attributes: {
            brutality: Decimal( inverseTriangleNumber(pointsAssigned.brutality) + 1).floor(),
            cunning: Decimal( inverseTriangleNumber(pointsAssigned.cunning)  + 1).floor(),
            deceit: Decimal( inverseTriangleNumber(pointsAssigned.deceit)  + 1).floor(),
            madness:Decimal( inverseTriangleNumber(pointsAssigned.madness)  + 1).floor(),
        }
    }
}

function triangleNumber(number) {
    return (number * (number + 1))/2;
}

function inverseTriangleNumber(number) {
    return Math.floor(Math.sqrt(number * 2));

}