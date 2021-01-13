import React from "react";
import {config} from "../config";
import {v4} from "node-uuid";
import {debugMessage} from "../debugging";
import {Regions} from "./Regions";
import {Decimal} from "decimal.js";
import {resolveCombat} from "../engine/combat";
import evaluateExpression from "../engine/general/evaluateExpression";
import {getCharacter, getGlobalState, reincarnateAs} from "../engine";

export const Actions = {
    exploring: {
        id: "exploring",
        duration: 5000,
        description: "Exploring...",
        complete: function () {
            getGlobalState().currentEncounter = null;
            return getCharacter(0).stolenPowerModifier.eq(1) ? "challenging" : "hunting";
        }
    },
    approaching: {
        id: "approaching",
        duration: 2500,
        description: "Approaching Enemy...",
        complete: function (rng, player, pushLogItem, setPaused, setEnemy, applyAction, setActionLog, nextAction) {
            // Since we're starting a new combat, remove any old, dead characters
            switch (getGlobalState().nextAction) {
                case "fighting":
                    const enemies = getGlobalState().currentEncounter.enemies;
                    const combatResult = resolveCombat(rng, {
                        parties: [[player], enemies]
                    });
                    getGlobalState().currentEncounter.pendingActions = combatResult.rounds;
                    setEnemy(enemies[0]);
                    break;
            }
            const deadCharacters = Object.keys(getGlobalState().characters)
                .filter(id => id !== '0' && !getGlobalState().currentEncounter.enemies.find(c => c.id == id));
            deadCharacters.forEach(id => {
                delete getGlobalState().characters[id]
            });
        }
    },
    looting: {
        id: "looting",
        duration: "exploration.lootingTime",
        description: "Looting the body..."
    },
    hunting: {
        id: "hunting",
        description: "Hunting for prey...",
        duration: 2000,
        complete: precombat
    },
    fleeing: {
        id: "fleeing",
        duration: 2000,
        description: "Fleeing in terror!",
        complete: function (rng, player, pushLogItem, setPaused, setEnemy, applyAction, setActionLog, nextAction) {
            const enemy = getGlobalState().currentEncounter.enemies[0];
            const chanceToFlee = evaluateExpression(config.encounters.chanceToEscapeGreater, {
                enemy,
                player: getCharacter(0)
            });
            const roll = Math.floor(rng.double() * 100) + 1;
            if (chanceToFlee.gte(roll)) {
                pushLogItem({
                    result: "escaped",
                    uuid: v4()
                });
                const powerToGain = evaluateExpression(config.mechanics.xp.gainedFromGreaterDemon, {
                    enemy: enemy
                });
                const powerGained = player.gainPower(powerToGain);
                getCharacter(0).highestLevelReached = Decimal.max(getCharacter(0).highestLevelReached, getCharacter(0).powerLevel);
                pushLogItem(`You gained ${powerGained.toFixed()} power.`);
                getGlobalState().currentEncounter = null;
                return "exploring";
            } else {
                pushLogItem({
                    message: `The ${enemy.name} caught you! (Roll ${roll} vs ${chanceToFlee})`,
                    uuid: v4()
                });
                const enemies = getGlobalState().currentEncounter.enemies;
                const combatResult = resolveCombat([[player], enemies]);
                getGlobalState().currentEncounter.pendingActions = combatResult.rounds;
                setEnemy(enemies[0]);
                return "fighting";
            }
        }
    },
    fighting: {
        id: "fighting",
        duration: 2000,
        description: "In Combat!",
        complete: function (rng, player, pushLogItem, setPaused, setEnemy, applyAction, setActionLog, nextAction) {
            const instantDeathLevel = evaluateExpression(config.encounters.lesserDemonInstantKillLevel, {
                highestLevelEnemyDefeated: getGlobalState().highestLevelEnemyDefeated
            });
            const enemy = getGlobalState().currentEncounter.enemies[0];
            if (enemy.powerLevel.lte(instantDeathLevel)) {
                pushLogItem({
                    message: `The raw power of your killer instinct destroys ${enemy.name}!`,
                    uuid: v4()
                });
                getGlobalState().currentEncounter.pendingActions = {
                    events: [
                        {
                            uuid: v4(),
                            result: "kill",
                            target: enemy.id,
                            actor: 0,
                            tick: 0
                        },
                        {
                            uuid: v4(),
                            result: "combat-end",
                            tick: 0
                        }
                    ]
                };
                applyAction({
                    uuid: v4(),
                    result: "kill",
                    target: enemy.id,
                    actor: 0,
                    tick: 0
                });
            } else {
                if (getGlobalState().currentEncounter.pendingActions.length) {
                    const nextRound = getGlobalState().currentEncounter.pendingActions[0];
                    if(nextRound.tick !== 0) {
                        pushLogItem(`<strong>Actions on ${nextRound.tick}</strong>`)
                    }
                    applyAction(nextRound);
                    if(nextRound.tick === 0) {
                        pushLogItem("Combat Begins!");
                        player.refreshBeforeCombat();
                    }
                    getGlobalState().currentEncounter.pendingActions.shift();
                    setActionLog([...getGlobalState().actionLog]);
                    if(nextRound.end) {
                        getGlobalState().nextAction = "exploring";
                    }
                } else {
                    return "fleeing";
                }
            }
        }
    },
    reincarnating: {
        id: "reincarnating",
        duration: 30000,
        description: "Reincarnating...",
        complete: function (rng, player, pushLogItem, setPaused, setEnemy, applyAction, setActionLog, nextAction) {
            getGlobalState().automaticReincarnate = true;
            reincarnateAs(getCharacter(0).appearance, {
                brutality: player.attributes.baseBrutality,
                cunning: player.attributes.baseCunning,
                deceit: player.attributes.baseDeceit,
                madness: player.attributes.baseMadness
            });
            return "exploring";
        }

    },
    intimidating: {
        id: "intimidating",
        duration: 1000,
        description: "Intimidating...",
        complete: function (rng, player, pushLogItem, setPaused, setEnemy, applyAction, setActionLog, nextAction) {
            const enemy = getGlobalState().currentEncounter.enemies[0];
            const instantDeathLevel = evaluateExpression(config.encounters.lesserDemonInstantKillLevel, {
                highestLevelEnemyDefeated: getGlobalState().highestLevelEnemyDefeated
            });
            if (enemy.powerLevel.lte(instantDeathLevel)) {
                pushLogItem(`Your force of will seizes control of ${enemy.name}'s mind!`);
                nextAction = "exploring";
            }
            const chanceToIntimidate = Decimal(enemy.powerLevel.lte(instantDeathLevel) ? 999 : evaluateExpression(config.encounters.chanceToIntimidateLesser, {
                enemy,
                player: getCharacter(0)
            }));
            const roll = Math.floor(rng.double() * 100) + 1;
            if (chanceToIntimidate.gte(roll)) {
                const periodicPowerIncreases = evaluateExpression(config.mechanics.xp.gainedFromLesserDemon, {
                    enemy
                });
                getCharacter(0).stolenPower = getCharacter(0).stolenPower.plus(periodicPowerIncreases);
                getGlobalState().highestLevelEnemyDefeated = Decimal.max(getGlobalState().highestLevelEnemyDefeated, enemy.powerLevel);
                if (enemy.isRival) {
                    pushLogItem("<strong>You bend your rival to your will!</strong>");
                    getGlobalState().rival = {};
                }
            }
            return "exploring";
        }
    },
    challenging: {
        id: "challenging",
        duration: 1000,
        description: "Finding challenger...",
        complete: precombat
    }
}

function precombat(rng, player, pushLogItem, setPaused, setEnemy, applyAction, setActionLog, nextAction) {
    if (getCharacter(0).powerLevel.gte(config.mechanics.maxLevel)) {
        pushLogItem({
            message: "Congratulations, you've reached the level cap. 👍",
            uuid: v4()
        });
        setPaused(getGlobalState().paused = true);
    }
    getCharacter(0).clearStatuses();

    let proceedingToEncounter = false;
    if (getCharacter(0).hp.lt(getCharacter(0).maximumHp)) {
        const encounterChance = Decimal(0);
        const amountToHeal = encounterChance.lte(0) || getCharacter(0).hp.plus(getCharacter(0).healing).gt(
            getCharacter(0).maximumHp
        ) ? getCharacter(0).maximumHp.minus(getCharacter(0).hp) : getCharacter(0).healing;
        getCharacter(0).hp = getCharacter(0).hp.plus(amountToHeal);
        pushLogItem({
            message: `You naturally healed ${amountToHeal} health`,
            uuid: v4()
        })
        const encounterRoll = Math.floor(rng.double() * 100) + 1;
        debugMessage(`Determining if encounter occurs. Chance ${encounterChance} vs roll ${encounterRoll}.`);
        if (encounterChance.gte(encounterRoll)) {
            proceedingToEncounter = true;
        } else {
            if (encounterChance.eq(0)) {
                pushLogItem({
                    message: "Your weak spiritual energy keeps you hidden while you heal.",
                    uuid: v4()
                });
            } else {
                pushLogItem({
                    message: "You don't find any trouble while you recover.",
                    uuid: v4()
                });
            }
        }
    } else {
        proceedingToEncounter = true;
    }
    if (proceedingToEncounter) {
        getGlobalState().currentEncounter = Regions[getGlobalState().currentRegion].startEncounter(getCharacter(0), rng);
        const enemy = getGlobalState().currentEncounter.enemies[0];
        setEnemy(enemy);
        const enemyType = player.otherDemonIsGreaterDemon(enemy) ? "greater" : (
            player.otherDemonIsLesserDemon(enemy) ? "lesser" : "peer"
        )
        const enemyDescription = enemy.adjectives.map(adj => adj.name).join(" ");
        pushLogItem(`<strong>Encountered ${enemyDescription} ${enemyType === 'greater' ? 'Greater ' : '' }${enemyType === 'lesser'?'Lesser ':''}${enemy.name}</strong>`);
        nextAction = getGlobalState().currentEncounter.enemies.reduce((actionSoFar, nextEnemy) => {
            if (actionSoFar !== "fighting") {
                return actionSoFar;
            }

            if (player.otherDemonIsLesserDemon(nextEnemy)) {
                return "intimidating";
            } else if (player.otherDemonIsGreaterDemon(nextEnemy)) {
                return "fleeing";
            } else {
                return "fighting";
            }
        }, "fighting");

        if (getGlobalState().passivePowerIncome.gt(0)) {
            const gainedPower = getCharacter(0).gainPower(getGlobalState().passivePowerIncome);
            pushLogItem({
                message: `Your Bound lesser demons grant you ${gainedPower.toFixed()} power.`,
                uuid: v4()
            });
            getCharacter(0).highestLevelReached = Decimal.max(getCharacter(0).highestLevelReached, getCharacter(0).powerLevel);
        }

        // Since we're starting a new combat, remove any old, dead characters
        switch (nextAction) {
            case "fighting":
            case "hunting":
                const enemies = getGlobalState().currentEncounter.enemies;
                const combatResult = resolveCombat([[player], enemies]);
                getGlobalState().currentEncounter.pendingActions = Object.keys(combatResult)
                    .map(tick => combatResult[tick]);
                setEnemy(enemies[0]);
                break;
        }
        const deadCharacters = Object.keys(getGlobalState().characters)
            .filter(id => id !== '0' && !getGlobalState().currentEncounter.enemies.find(c => c.id == id));
        deadCharacters.forEach(id => {
            delete getGlobalState().characters[id]
        });
    }
    return nextAction;
}