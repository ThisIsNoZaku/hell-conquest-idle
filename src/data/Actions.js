import React from "react";
import {getConfigurationValue} from "../config";
import {v4} from "node-uuid";
import {debugMessage} from "../debugging";
import {Regions} from "./Regions";
import {Decimal} from "decimal.js";
import {resolveCombat, resolveCombatRound} from "../engine/combat";
import {getCharacter, getGlobalState, reincarnateAs} from "../engine";
import calculateStaminaCostToFlee from "../engine/general/calculateStaminaCostToFlee";
import calculateInstantDeathLevel from "../engine/combat/calculateInstantDeathLevel";
import {onIntimidation} from "../engine/general/onIntimidation";

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
            return "fighting";
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
                return "exploring";
            } else {
                pushLogItem("You have been caught!");
                return "fighting";
            }
        }
    },
    fighting: {
        id: "fighting",
        duration: 2000,
        description: "In Combat!",
        complete: function (rng, player, pushLogItem, setPaused, setEnemy, applyAction, setActionLog, nextAction) {
            const instantDeathLevel = calculateInstantDeathLevel(player);
            const enemy = getGlobalState().currentEncounter.enemies[0];
            if (enemy.powerLevel.lte(instantDeathLevel)) {
                pushLogItem({
                    message: `The raw power of your killer instinct destroys ${enemy.name}!`,
                    uuid: v4()
                });
                applyAction({
                    events: [{
                        uuid: v4(),
                        event: "kill",
                        target: enemy.id,
                        source: 0,
                        tick: 0
                    }]
                });
                return ["exploring", "challenging"];
            } else {
                const currentEncounter = getGlobalState().currentEncounter;
                // Start of combat
                if (currentEncounter.currentTick === 0) {
                    pushLogItem("Combat Begins!");
                    player.refreshBeforeCombat();
                    currentEncounter.currentTick += 100;
                    return "fighting";
                } else {
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
                return "fleeing";
            }
        }
    },
    reincarnating: {
        id: "reincarnating",
        duration: 30000,
        description: "Reincarnating...",
        complete: function (rng, player, pushLogItem, setPaused, setEnemy, applyAction, setActionLog, nextAction) {
            getGlobalState().automaticReincarnate = true;
            reincarnateAs(player.appearance, {
                baseBrutality: player.attributes.baseBrutality,
                baseCunning: player.attributes.baseCunning,
                baseDeceit: player.attributes.baseDeceit,
                baseMadness: player.attributes.baseMadness
            });
            return ["exploring", "challenging"];
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
            if (enemy.powerLevel.lte(instantDeathLevel)) {
                pushLogItem(`Your force of will seizes control of ${enemy.name}'s mind!`);
                intimidateSuccess = true;
            } else if (player.combat.stamina.gte(enemy.combat.stamina)) {
                player.combat.stamina = player.combat.stamina.minus(enemy.combat.stamina);
                intimidateSuccess = true;
            } else {
                pushLogItem(`Your lack of stamina allows ${enemy.name} to escape!`);
                getGlobalState().currentEncounter = null;
            }
            if (intimidateSuccess) {
                onIntimidation(player, enemy, pushLogItem);
            }
            return "exploring";
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
            const playerHealing = player.healing;

            const amountToHeal = Decimal.min(playerHealing, player.maximumHp.minus(player.hp));
            player.hp = player.hp.plus(amountToHeal);

            const staminaToRecover = Decimal.min(player.combat.maximumStamina.div(2).ceil(),
                player.combat.maximumStamina.minus(player.combat.stamina));
            player.combat.stamina = player.combat.stamina.plus(staminaToRecover);
            if (staminaToRecover.gt(0) || amountToHeal.gt(0)) {
                const elements = [
                    amountToHeal.gt(0) ? `You recovered ${amountToHeal.toFixed()} health.` : null,
                    staminaToRecover.gt(0) ? `You regained ${staminaToRecover.toFixed()} stamina.` : null
                ];
                const message = elements.join(" ");
                if (message) {
                    pushLogItem(message);
                }
            }
            return ["exploring", "challenging"];
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
    if (getCharacter(0).powerLevel.gte(getConfigurationValue("mechanics.maxLevel"))) {
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
        const deadCharacters = Object.keys(getGlobalState().characters)
            .filter(id => id !== '0' && !getGlobalState().currentEncounter.enemies.find(c => c.id == id));
        deadCharacters.forEach(id => {
            delete getGlobalState().characters[id]
        });
    }
    return nextAction;
}