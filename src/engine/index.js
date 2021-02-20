import * as _ from "lodash";
import {assertCreatureExists, Creatures, titles} from "../data/creatures";
import {debugMessage} from "../debugging";
import {Decimal} from "decimal.js";
import {Character} from "../character";
import {getConfigurationValue} from "../config";
import * as Package from "../../package.json";
import changelog from "../changelog.json";
import pkg from "../../package.json";
import evaluateExpression from "./general/evaluateExpression";
import calculateNPCBonuses from "./general/calculateNpcBonuses";
import {Traits} from "../data/Traits";
import {ActionEnhancements} from "../data/ActionEnhancements";

export const saveKey = require("md5")(`hell-conquest-${Package.version}`);

let globalState = loadGlobalState()

export function getGlobalState() {
    return globalState;
}

export function saveGlobalState() {
    window.localStorage.setItem(saveKey, JSON.stringify(globalState));
}

export function loadGlobalState() {
    validate();
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
        time: 0,
        rivals: {},
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
        manualSpeedMultiplier: getConfigurationValue("manualSpeedup.enabled", false) ? getConfigurationValue("manualSpeedup.multiplier", 1) : 1,
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
                party: 0,
                isPc: true,
                name: "You",
                powerLevel: Decimal(1),
                appearance: "",
                statuses: {},
                traits: {},
                tactics: {
                    offensive: "attrit",
                    defensive: "block"
                },
                attributes: {
                    baseBrutality: getConfigurationValue("mechanics.combat.playerAttributeMinimum"),
                    baseCunning: getConfigurationValue("mechanics.combat.playerAttributeMinimum"),
                    baseDeceit: getConfigurationValue("mechanics.combat.playerAttributeMinimum"),
                    baseMadness: getConfigurationValue("mechanics.combat.playerAttributeMinimum")
                },
                combat: {}
            }, 0)
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
    try {
        if (getConfigurationValue("debug")) {
            debugMessage(`Generating creature with id ${id} and level ${powerLevel}`);
        }
        if (powerLevel === undefined) {
            throw new Error("No powerLevel");
        }
        if (Number.isNaN(powerLevel)) {
            throw new Error("Level cannot be NaN");
        }
        // Adjectives
        if (!Object.keys(titles).includes(Creatures[id].npc.adjective)) {
            throw new Error(Creatures[id].npc.adjective);
        }
        const adjective = titles[Creatures[id].npc.adjective];
        const {offensiveTactics, defensiveTactics} = determineCreatureTactics(id, adjective);
        const nextId = nextMonsterId++;
        // Starting traits
        const startingTraits = Creatures[id].traits.reduce((traits, next) => {
            traits[next] = powerLevel.div(getConfigurationValue("trait_tier_up_levels")).ceil();
            return traits;
        }, {});

        const bonusPoints = evaluateExpression(getConfigurationValue("bonus_points_for_highest_level"), {
            highestLevelReached: Decimal(powerLevel)
        })
        const bonuses = calculateNPCBonuses(bonusPoints.toNumber(), [adjective], startingTraits);
        globalState.characters[nextId] = new Character({
            id: nextId,
            ..._.omit(Creatures[id], ["npc"]),
            latentPower: Decimal.max(0, Decimal(powerLevel.minus(2).times(10))), // FIXME: Make configurable value
            tactics: {
                offensive: offensiveTactics,
                defensive: defensiveTactics
            },
            adjectives: [Creatures[id].npc.adjective],
            traits: {...startingTraits, ...bonuses.traits},
            powerLevel: powerLevel,
            party: 1,
            highestLevelEnemyDefeated: Decimal(powerLevel),
            attributes: {
                baseBrutality: bonuses.attributes.brutality,
                baseCunning: bonuses.attributes.cunning,
                baseDeceit: bonuses.attributes.deceit,
                baseMadness: bonuses.attributes.madness
            }
        }, 1);
        saveGlobalState();
        return globalState.characters[nextId];
    } catch (e) {
        throw new Error(`Error generating creature ${id}: ${e.error}`);
    }
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

export function unpause() {
    globalState.paused = false;
}

function stateReviver(key, value) {
    switch (key) {
        case "characters":
            return Object.keys(value).reduce((characters, id) => {
                characters[id] = new Character(value[id], id === "0" ? 0 : 1);
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
        case "time":
            return 0;
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

export function triangleNumber(number) {
    return (number * (number + 1)) / 2;
}

export function inverseTriangleNumber(number) {
    return Math.floor(Math.sqrt(number * 2));

}

export function determineCreatureTactics(id, adjective) {
    const creature = Creatures[id];
    const offensiveTactics = _.get(creature, ["npc", "tactics", adjective, "offensive"], creature.npc.tactics.default.offensive)
    const defensiveTactics = _.get(creature, ["npc", "tactics", adjective, "defensive"], creature.npc.tactics.default.defensive)
    return {
        offensiveTactics,
        defensiveTactics
    }
}

function validate() {
    Object.keys(Creatures).forEach(creature => {
        try {
            Creatures[creature].traits.forEach(t => {
                if (!Traits[t]) {
                    throw new Error(`Creature ${creature} has trait ${t} which is not defined.`);
                }
            });
            const adjective = Creatures[creature].npc.adjective;
            if (!titles[adjective]) {
                throw new Error(`Creature ${creature} has adjective ${Creatures[creature].npc.adjective} which is not defined.`);
            }
        } catch (e) {
            throw new Error(`An error occurred processing ${creature}: ${e.message}`);
        }
    });
    Object.keys(Traits).forEach(trait => {
        if(trait.attack_enhancement && !ActionEnhancements[trait.attack_enhancement]) {
            throw new Error(`Trait ${trait} uses attack enhancement ${trait.attack_enhancement} which doesn't exist.`)
        }
        if(trait.defense_enhancement && !ActionEnhancements[trait.defense_enhancement]) {
            throw new Error(`Trait ${trait} uses defense enhancement ${trait.defense_enhancement} which doesn't exist.`)
        }
    });
}