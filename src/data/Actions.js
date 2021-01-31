import React from "react";
import {getConfigurationValue} from "../config";
import {v4} from "node-uuid";
import {Regions} from "./Regions";
import {Decimal} from "decimal.js";
import {resolveCombatRound} from "../engine/combat";
import {getCharacter, getGlobalState} from "../engine";
import calculateStaminaCostToFlee from "../engine/general/calculateStaminaCostToFlee";
import calculateInstantDeathLevel from "../engine/combat/calculateInstantDeathLevel";
import {onIntimidation} from "../engine/general/onIntimidation";
import reincarnateAs from "../engine/general/reincarnateAs";
import cleanupDeadCharacters from "../engine/general/cleanupDeadCharacters";
import triggerEvent from "../engine/general/triggerEvent";
import generateRoundActionLogItems from "../engine/general/generateRoundActionLogItems";
import {generateKillEvent} from "../engine/events/generate";

const defaultActions = ["exploring", "challenging"];

export const Actions = {
    exploring: {
        id: "exploring",
        duration: 5000,
        description: "Exploring...",
        complete: function (rng, player, pushLogItem, setPaused, setEnemy, applyAction, setActionLog, nextAction) {
            getGlobalState().currentEncounter = null;
            return nextAction;
        }
    },
    approaching: {
        id: "approaching",
        duration: 5000,
        description: "Approaching Enemy...",
        complete: function (rng, player, pushLogItem, setPaused, setEnemy, applyAction, setActionLog, nextAction) {
            // Since we're starting a new combat, remove any old, dead characters
            const enemies = getGlobalState().currentEncounter.enemies;

            setEnemy(enemies[0]);
            const deadCharacters = Object.keys(getGlobalState().characters)
                .filter(id => id !== '0' && !getGlobalState().currentEncounter.enemies.find(c => c.id == id));
            deadCharacters.forEach(id => {
                delete getGlobalState().characters[id]
            });
            player.combat.refresh();
            // Default action.
            return nextAction;
        }
    },
    looting: {
        id: "looting",
        duration: "exploration.lootingTime",
        description: "Looting the body..."
    },
    fleeing: {
        id: "fleeing",
        duration: 2000,
        description: "Fleeing in terror!",
        complete: function (rng, player, pushLogItem, setPaused, setEnemy, applyAction, setActionLog, nextAction) {
            const enemy = getGlobalState().currentEncounter.enemies[0];
            const costToFlee = calculateStaminaCostToFlee(player, enemy);
            if (player.combat.stamina.gte(costToFlee)) {
                pushLogItem("Escaped!");
                player.combat.stamina = player.combat.stamina.minus(costToFlee);
                return "recovering";
            } else {
                pushLogItem("You have been caught!");
                return "fighting";
            }
        }
    },
    fighting: {
        id: "fighting",
        duration: 1000,
        description: "In Combat!",
        complete: function (rng, player, pushLogItem, setPaused, setEnemy, applyAction, setActionLog, nextAction) {
            const instantDeathLevel = calculateInstantDeathLevel(player);
            const enemy = getGlobalState().currentEncounter.enemies[0];
            if (enemy.powerLevel.lte(instantDeathLevel)) {
                pushLogItem({
                    message: `The raw power of your killer instinct destroys ${enemy.name}!`,
                    uuid: v4()
                });
                enemy.hp = Decimal(0);
                applyAction({
                    events: [generateKillEvent(player, enemy)]
                });
                return defaultActions;
            } else {
                const currentEncounter = getGlobalState().currentEncounter;
                // Start of combat
                if (currentEncounter.currentTick === 0) {
                    pushLogItem("Combat Begins!");
                    player.refreshBeforeCombat();
                    currentEncounter.currentTick += 100;
                    const events = [];
                    triggerEvent({
                        type: "on_combat_start",
                        combatants: {
                            0: player,
                            [enemy.id]: enemy
                        },
                        source: {character:player},
                        target: enemy,
                        roundEvents: events
                    });
                    triggerEvent({
                        type: "on_combat_start",
                        combatants: {
                            0: player,
                            [enemy.id]: enemy
                        },
                        source: {character:enemy},
                        target: player,
                        roundEvents: events
                    });
                    player.combat.stamina = player.energyGeneration.times(100).floor();
                    enemy.combat.stamina = enemy.energyGeneration.times(100).floor();
                    generateRoundActionLogItems({
                        events
                    }).forEach(event => {
                        pushLogItem(event);
                    })

                }
                const nextRound = resolveCombatRound(currentEncounter.currentTick, {
                    0: player,
                    [currentEncounter.enemies[0].id]: currentEncounter.enemies[0]
                });
                if (nextRound.tick !== 0) {
                    pushLogItem(`<strong>Actions on ${nextRound.tick}</strong>`);
                }
                applyAction(nextRound);

                setActionLog([...getGlobalState().actionLog]);

                if (nextRound.end) {
                    player.combat.stamina = Decimal(0);
                    player.temporaryTraits = {};
                    enemy.temporaryTraits = {};
                    if (player.isAlive) {
                        return "recovering";
                    } else {
                        return "reincarnating";
                    }
                } else {
                    currentEncounter.currentTick += 100;
                    return "fighting";
                }
            }
        }
    },
    reincarnating: {
        id: "reincarnating",
        duration: 10000,
        description: "Reincarnating...",
        complete: function (rng, player, pushLogItem, setPaused, setEnemy, applyAction, setActionLog, nextAction) {
            getGlobalState().automaticReincarnate = true;
            reincarnateAs(player.appearance, {
                baseBrutality: player.attributes.baseBrutality,
                baseCunning: player.attributes.baseCunning,
                baseDeceit: player.attributes.baseDeceit,
                baseMadness: player.attributes.baseMadness
            });
            setEnemy(null);
            return defaultActions;
        }

    },
    intimidating: {
        id: "intimidating",
        duration: 1000,
        description: "Intimidating...",
        complete: function (rng, player, pushLogItem, setPaused, setEnemy, applyAction, setActionLog, nextAction) {
            const enemy = getGlobalState().currentEncounter.enemies[0];
            const instantDeathLevel = calculateInstantDeathLevel(player);
            let intimidateSuccess = false;
            const energyNeededToBind = enemy.powerLevel.times(100)
                .times(Decimal(1)
                    .minus(Decimal(player.attributes[getConfigurationValue("intimidation_cost_attribute")]).times(0.05))); // FIXME: Move to configuration.
            if (enemy.powerLevel.lte(instantDeathLevel)) {
                pushLogItem(`Your force of will seizes control of ${enemy.name}'s mind!`);
                intimidateSuccess = true;
            } else if (player.combat.stamina.gte(energyNeededToBind)) { // FIXME: Make configuration
                player.combat.stamina = player.combat.stamina.minus(energyNeededToBind);
                intimidateSuccess = true;
                pushLogItem(`You spend ${energyNeededToBind} energy to bind ${enemy.name}!`);
            } else {
                pushLogItem(`Your lack of stamina allows ${enemy.name} to escape! (Required ${enemy.powerLevel.times(100)} but had ${player.combat.stamina})`);
                getGlobalState().currentEncounter = null;
            }
            if (intimidateSuccess) {
                onIntimidation(player, enemy, pushLogItem);
            }
            return defaultActions;
        }
    },
    hunting: {
        id: "hunting",
        description: "Hunting for prey...",
        duration: 2000,
        complete: precombat
    },
    challenging: {
        id: "challenging",
        duration: 1000,
        description: "Finding challenger...",
        complete: precombat
    },
    recovering: {
        id: "recovering",
        duration: 1000,
        description: "Recovering...",
        complete: function (rng, player, pushLogItem) {
            player.refreshBeforeCombat();
            const playerHealing = player.healing;

            const amountToHeal = Decimal.min(playerHealing, player.maximumHp.minus(player.hp));
            player.hp = player.hp.plus(amountToHeal);

            const staminaToRecover = Decimal(0);
            player.combat.stamina = player.combat.stamina.plus(staminaToRecover);
            if (staminaToRecover.gt(0) || amountToHeal.gt(0)) {
                const elements = [
                    amountToHeal.gt(0) ? `You recovered ${amountToHeal.toFixed()} health.` : null,
                    staminaToRecover.gt(0) ? `You recovered ${staminaToRecover.toFixed()} stamina.` : null
                ];
                const message = elements.filter(m => m != null).join(" ");
                if (message) {
                    pushLogItem(message);
                }
            }
            return defaultActions;
        }
    },
    usurp: {
        id: "usurp",
        duration: 1000,
        description: "Approaching foe...",
        complete: precombat
    }
}

function precombat(rng, player, pushLogItem, setPaused, setEnemy, applyAction, setActionLog, nextAction) {
    if (getCharacter(0).powerLevel.gte(getConfigurationValue("game_level_cap"))) {
        pushLogItem({
            message: "Congratulations, you've reached the level cap. 👍",
            uuid: v4()
        });
        setPaused(getGlobalState().paused = true);
    }
    getCharacter(0).clearStatuses();

    let proceedingToEncounter = true; // FIXME
    if (proceedingToEncounter) {
        getGlobalState().currentEncounter = Regions[getGlobalState().currentRegion].startEncounter(getCharacter(0), rng);
        const enemy = getGlobalState().currentEncounter.enemies[0];
        setEnemy(enemy);
        const enemyType = player.otherDemonIsGreaterDemon(enemy) ? "greater" : (
            player.otherDemonIsLesserDemon(enemy) ? "lesser" : "peer"
        )
        const enemyDescription = enemy.adjectives.map(adj => adj.name).join(" ");
        pushLogItem(`<strong>Encountered ${enemyDescription} ${enemyType === 'greater' ? 'Greater ' : ''}${enemyType === 'lesser' ? 'Lesser ' : ''}${enemy.name}</strong>`);
        nextAction = ["approaching", "fighting"];

        if (getGlobalState().passivePowerIncome.gt(0)) {
            const gainedPower = getCharacter(0).gainPower(getGlobalState().passivePowerIncome);
            pushLogItem({
                message: `Your Bound lesser demons grant you ${gainedPower.toFixed()} power.`,
                uuid: v4()
            });
            getCharacter(0).highestLevelReached = Decimal.max(getCharacter(0).highestLevelReached, getCharacter(0).powerLevel);
        }

        // Since we're starting a new combat, remove any old, dead characters
        cleanupDeadCharacters();
    }
    return nextAction;
}