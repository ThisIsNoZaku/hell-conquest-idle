import PlayerStats from "../PlayerStats";
import TopSection from "../TopSection";
import {
    evaluateExpression,
    getCharacter,
    getGlobalState,
    getManualSpeedMultiplier, reincarnateAs,
    saveGlobalState
} from "../../engine";
import BottomSection from "../BottomSection";
import EnemySidebar from "../EnemySidebar";
import React, {useEffect, useRef, useState} from "react";
import * as _ from "lodash";
import {config} from "../../config";
import {Actions} from "../../data/Actions";
import {debugMessage} from "../../debugging";
import {Decimal} from "decimal.js";
import {v4} from "node-uuid";
import {Regions} from "../../data/Regions";
import {resolveCombat} from "../../engine/combat";
import {useHotkeys} from "react-hotkeys-hook";
import generateLogItem from "../../generateLogItem";
import {Traits} from "../../data/Traits";
import {useHistory} from "react-router-dom";

const styles = {
    root: {
        display: "flex",
        flex: "1",
        flexDirection: "row",
        justifyContent: "space-between",
        overflow: "hidden"
    },
    image: {
        position: "absolute",
        height: "100%",
        left: 0
    },
    background: {
        position: "absolute",
        height: "100%",
        width: "100%",
        left: 0
    }
}

let lastTime;

function changeCurrentAction(newAction) {
    getGlobalState().currentAction = newAction;
    return getGlobalState().currentAction;
}

function pushLogItem(item) {
    if (getGlobalState().actionLog.length > (config.actionLog.maxSize || 10)) {
        getGlobalState().actionLog.pop();
    }
    getGlobalState().actionLog.unshift(generateLogItem(item));
}

export default function AdventuringPage(props) {
    const accruedTime = useRef(0);
    const [enemy, setEnemy] = useState(_.get(getGlobalState(), ["currentEncounter", "enemies", 0]));
    const [actionLog, setActionLog] = useState(getGlobalState().actionLog);
    const [currentEncounter, setCurrentEncounter] = useState(getGlobalState().currentEncounter);
    const [currentAction, setCurrentAction] = useState(Actions[getGlobalState().currentAction]);
    const [nextAction, setNextAction] = useState(getGlobalState().nextAction);
    const [paused, setPaused] = useState(getGlobalState().paused);
    const [displayedTime, setDisplayedTime] = useState(0);
    const [player, setPlayer] = useState(getCharacter(0));
    const manualSpeedUpActive = useRef(false);
    const [automaticReincarnate, setAutomaticReincarnate] = useState(getGlobalState().automaticReincarnate);

    function togglePause() {
        getGlobalState().paused = !getGlobalState().paused;
        setPaused(getGlobalState().paused);
    }

    const history = useHistory();

    useHotkeys("p", () => getGlobalState().paused = !getGlobalState().paused);

    useEffect(() => {
        let lastFrame;

        function applyAction(action, lastTick) {
            if (lastTick !== undefined && action.tick && action.tick !== lastTick) {
                debugMessage(`Not consuming an action for tick ${action.tick} on tick ${lastTick}`);
                return;
            }
            pushLogItem(action);
            switch (action.result) {
                case "combat-end":
                    if (!getCharacter(0).isAlive) {
                        setCurrentAction(Actions[changeCurrentAction("reincarnating")]);
                    } else {
                        if (config.mechanics.artifacts.enabled) {
                            setCurrentAction(Actions[changeCurrentAction("looting")]);
                        } else {
                            setCurrentAction(Actions[changeCurrentAction("exploring")]);
                        }
                    }
                    return;
                    break;
                case "kill":
                    const enemy = getCharacter(action.target);
                    if (action.actor === 0 && action.target !== 0) {
                        debugMessage("Player killed an enemy and gained power.");
                        const player = getCharacter(0);
                        const powerToGain = evaluateExpression(config.mechanics.xp.gainedFromOtherDemon, {
                            enemy
                        });
                        let multiplier = Object.keys(player.traits).reduce((multiplier, trait) => {
                            const traitMultiplier = evaluateExpression(_.get(Traits[trait].on_kill, ["effects", "power_gain_modifier"], 0),
                                {
                                    rank: Decimal(player.traits[trait])
                                });
                            return multiplier.plus(traitMultiplier);
                        }, Decimal(1));
                        const pregainLevel = player.powerLevel;
                        const powerGained = player.gainPower(powerToGain.times(multiplier).floor());
                        pushLogItem(generateLogItem({
                            result: "gainedPower",
                            value: powerGained
                        }));
                        if (!pregainLevel.eq(player.powerLevel)) {
                            const currentHp = player.currentHp;
                            player.currentHp = player.maximumHp;
                            pushLogItem({
                                message: `The surge of new power heals you for ${player.currentHp.minus(currentHp)} health.`,
                                uuid: v4()
                            })
                        }
                        if (!getGlobalState().automaticReincarnate) {
                            getGlobalState().highestLevelEnemyDefeated = Decimal.max(getGlobalState().highestLevelEnemyDefeated, enemy.powerLevel);
                        }
                        getCharacter(0).highestLevelReached = Decimal.max(getGlobalState().highestLevelReached, getCharacter(0).powerLevel);
                        if(enemy.isRival) {
                            getGlobalState().rival = {};
                            pushLogItem({
                                message: "You've defeated your rival!",
                                uuid: v4()
                            })
                        }
                    } else if (action.target === 0) {
                        if(Decimal(enemy.powerLevel).gt(getGlobalState().rival.level || 0)) {
                            getGlobalState().rival = {
                                level: enemy.powerLevel,
                                type: enemy.appearance,
                                traits: enemy.traits,
                                tactics: enemy.tactics
                            }
                            pushLogItem({
                                message: "<strong>You have a new rival!</strong>",
                                uuid: v4()
                            })
                        }
                        getCharacter(0).currentHp = Decimal(0);
                    }
                    break;
                case "hit":
                case "miss":
                    (action.effects || []).forEach(effect => {
                        const targetCharacter = getCharacter(effect.target);
                        switch (effect.event) {
                            case "damage":
                                targetCharacter.currentHp = targetCharacter.currentHp.minus(effect.value);
                                if (targetCharacter.currentHp.lt(Decimal(0))) {
                                    targetCharacter.currentHp = Decimal(0);
                                }
                                break;
                            case "add_statuses":
                                const characterStatuses = getCharacter(effect.target).statuses;
                                characterStatuses[effect.status] = effect.level;
                                break;
                        }
                    });
                    break;
                case "fatigue-damage":
                    const targetCharacter = getCharacter(action.actor);
                    targetCharacter.currentHp = targetCharacter.currentHp.minus(action.value);
                    break;
                case "add_statuses":
                    const characterStatuses = getCharacter(action.target).statuses;
                    characterStatuses[action.status] = action.level;
                    break;
                case "status-removed": {
                    const characterStatuses = getCharacter(action.actor).statuses;
                    delete characterStatuses[action.status];
                }
                case "action_skipped":
                    break;
                default:
                    throw new Error();
            }
            // Consume action
            getGlobalState().currentEncounter.pendingActions.shift()
            saveGlobalState();
            const nextAction = getGlobalState().currentEncounter.pendingActions[0];
            if (nextAction) {
                applyAction(nextAction, action.tick);
            }
        }

        function tick(timestamp) { // FIXME: Optimize, serious performance bottleneck
            if (!lastTime) {
                lastTime = timestamp;
            } else if (!getGlobalState().paused) {
                const actionDuration = typeof Actions[getGlobalState().currentAction].duration === "number" ?
                    Actions[getGlobalState().currentAction].duration : _.get(getGlobalState(), Actions[getGlobalState().currentAction].duration);
                const player = getCharacter(0);
                if (accruedTime.current >= actionDuration) {
                        const player = getCharacter(0);
                        saveGlobalState();
                        accruedTime.current = 0;
                        switch (getGlobalState().currentAction) {
                            case "exploring":
                                if (getCharacter(0).powerLevel.gte(config.mechanics.maxLevel)) {
                                    pushLogItem({
                                        message: "Congratulations, you've reached the level cap. 👍",
                                        uuid: v4()
                                    });
                                    setPaused(getGlobalState().paused = true);
                                }
                                if (getCharacter(0).isAlive) {
                                    setCurrentEncounter(getGlobalState().currentEncounter = null);
                                    setEnemy(null);
                                }
                                getCharacter(0).clearStatuses();
                                let proceedingToEncounter = false;
                                if (getCharacter(0).currentHp.lt(getCharacter(0).maximumHp)) {
                                    const encounterChance = evaluateExpression(config.mechanics.combat.randomEncounterChance, {
                                        player
                                    });
                                    const amountToHeal = encounterChance.lte(0) || getCharacter(0).currentHp.plus(getCharacter(0).healing).gt(
                                        getCharacter(0).maximumHp
                                    ) ? getCharacter(0).maximumHp.minus(getCharacter(0).currentHp) : getCharacter(0).healing;
                                    getCharacter(0).currentHp = getCharacter(0).currentHp.plus(amountToHeal);
                                    pushLogItem({
                                        message: `You naturally healed ${amountToHeal} health`,
                                        uuid: v4()
                                    })
                                    const encounterRoll = Math.floor(props.rng.double() * 100) + 1;
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
                                    getGlobalState().currentEncounter = Regions[getGlobalState().currentRegion].startEncounter(getCharacter(0), props.rng);
                                    setCurrentEncounter(getGlobalState().currentEncounter);
                                    setEnemy(getGlobalState().currentEncounter.enemies[0]);
                                    setCurrentAction(Actions[changeCurrentAction("approaching")]);
                                    getGlobalState().nextAction = getGlobalState().currentEncounter.enemies.reduce((actionSoFar, nextEnemy) => {
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
                                    setNextAction(getGlobalState().nextAction);
                                    if (getGlobalState().passivePowerIncome.gt(0)) {
                                        const gainedPower = getCharacter(0).gainPower(getGlobalState().passivePowerIncome);
                                        pushLogItem({
                                            message: `Your Bound lesser demons grant you ${gainedPower.toFixed()} power.`,
                                            uuid: v4()
                                        });
                                        getCharacter(0).highestLevelReached = Decimal.max(getGlobalState().highestLevelReached, getCharacter(0).powerLevel);
                                    }
                                    saveGlobalState();
                                }
                                break;
                            case "approaching": {
                                    // Since we're starting a new combat, remove any old, dead characters
                                    switch (getGlobalState().nextAction) {
                                        case "fighting":
                                            const enemies = getGlobalState().currentEncounter.enemies;
                                            const combatResult = resolveCombat(props.rng, {
                                                parties: [[player], enemies]
                                            });
                                            getGlobalState().currentEncounter.pendingActions = combatResult.rounds;
                                            setEnemy(enemies[0]);
                                            break;
                                    }
                                    setCurrentAction(Actions[changeCurrentAction(getGlobalState().nextAction)]);
                                    setNextAction();
                                    const deadCharacters = Object.keys(getGlobalState().characters)
                                        .filter(id => id !== '0' && !getGlobalState().currentEncounter.enemies.find(c => c.id == id));
                                    deadCharacters.forEach(id => {
                                        delete getGlobalState().characters[id]
                                    });
                                break;
                            }
                            case "intimidating": {
                                const enemy = getGlobalState().currentEncounter.enemies[0];
                                const instantDeathLevel = evaluateExpression(config.encounters.lesserDemonInstantKillLevel, {
                                    highestLevelEnemyDefeated: getGlobalState().highestLevelEnemyDefeated
                                });
                                if(enemy.powerLevel.lte(instantDeathLevel)) {
                                    pushLogItem({
                                        message: `Your force of will seizes control of ${enemy.name}'s mind!`,
                                        uuid: v4()
                                    })
                                    setCurrentAction(Actions[changeCurrentAction("exploring")]);
                                }
                                const chanceToIntimidate = Decimal(enemy.powerLevel.lte(instantDeathLevel) ? 999 : evaluateExpression(config.encounters.chanceToIntimidateLesser, {
                                    enemy,
                                    player: getCharacter(0)
                                }));
                                const roll = Math.floor(props.rng.double() * 100) + 1;
                                if (chanceToIntimidate.gte(roll)) {
                                    const periodicPowerIncreases = evaluateExpression(config.mechanics.xp.gainedFromLesserDemon, {
                                        enemy
                                    });
                                    pushLogItem(generateLogItem({
                                        result: "intimidated",
                                        target: enemy.id,
                                        value: periodicPowerIncreases
                                    }));
                                    getGlobalState().passivePowerIncome = getGlobalState().passivePowerIncome.plus(periodicPowerIncreases);
                                } else {
                                    pushLogItem(generateLogItem({
                                        message: `${getCharacter(enemy.id).name} escaped! (You rolled ${roll} vs ${chanceToIntimidate} chance to Bind).`
                                    }));
                                    setCurrentEncounter(getGlobalState().currentEncounter = null);
                                }
                                setCurrentAction(Actions[changeCurrentAction("exploring")]);
                                break;
                            }
                            case "fleeing":
                                const enemy = getGlobalState().currentEncounter.enemies[0];
                                const chanceToFlee = evaluateExpression(config.encounters.chanceToEscapeGreater, {
                                    enemy,
                                    player: getCharacter(0)
                                });
                                const roll = Math.floor(props.rng.double() * 100) + 1;
                                if (chanceToFlee.gte(roll)) {
                                    pushLogItem({
                                        result: "escaped",
                                        uuid: v4()
                                    });
                                    const powerToGain = evaluateExpression(config.mechanics.xp.gainedFromGreaterDemon, {
                                        enemy: enemy
                                    });
                                    const powerGained = player.gainPower(powerToGain);
                                    getCharacter(0).highestLevelReached = Decimal.max(getGlobalState().highestLevelReached, getCharacter(0).powerLevel);
                                    pushLogItem(generateLogItem({
                                        result: "gainedPower",
                                        value: powerGained,
                                    }));
                                    getGlobalState().currentEncounter = null;
                                    setCurrentEncounter(null);
                                    setCurrentAction(Actions[changeCurrentAction("exploring")]);
                                } else {
                                    pushLogItem({
                                        message: `The ${enemy.name} caught you! (Roll ${roll} vs ${chanceToFlee})`,
                                        uuid: v4()
                                    });
                                    const enemies = getGlobalState().currentEncounter.enemies;
                                    const combatResult = resolveCombat(props.rng, {
                                        parties: [[player], enemies]
                                    });
                                    getGlobalState().currentEncounter.pendingActions = combatResult.rounds;
                                    setEnemy(enemies[0]);
                                    setNextAction(Actions[changeCurrentAction("fighting")]);
                                    setCurrentAction(Actions[changeCurrentAction("fighting")]);
                                }

                                break;
                            case "fighting" : {
                                const instantDeathLevel = evaluateExpression(config.encounters.lesserDemonInstantKillLevel, {
                                    highestLevelEnemyDefeated: getGlobalState().highestLevelEnemyDefeated
                                });
                                const enemy = getGlobalState().currentEncounter.enemies[0];
                                if(enemy.powerLevel.lte(instantDeathLevel)) {
                                    pushLogItem({
                                        message: `The raw power of your killer instinct destroys ${enemy.name}!`,
                                        uuid: v4()
                                    });
                                    getGlobalState().currentEncounter.pendingActions = [
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
                                    ];
                                    applyAction({
                                        uuid: v4(),
                                        result: "kill",
                                        target: enemy.id,
                                        actor: 0,
                                        tick: 0
                                    });
                                    // setCurrentAction(Actions[changeCurrentAction("exploring")]);
                                } else {
                                    if (getGlobalState().currentEncounter.pendingActions.length) {
                                        const nextAction = getGlobalState().currentEncounter.pendingActions[0];
                                        applyAction(nextAction);
                                        setActionLog([...getGlobalState().actionLog]);
                                    } else {
                                        setCurrentAction(Actions[changeCurrentAction("fleeing")]);
                                    }
                                }
                                break;
                            }
                            case "looting":
                                const lootRoll = Math.floor(props.rng.double() * 666);
                                if (lootRoll <= getGlobalState().currentEncounter.encounterLevel) {

                                }
                                setCurrentAction(Actions[changeCurrentAction("exploring")]);
                                break;
                            case "reincarnating": {
                                setAutomaticReincarnate(getGlobalState().automaticReincarnate = true);
                                const player = getCharacter(0);
                                reincarnateAs(getCharacter(0).appearance, {
                                    brutality: player.attributes.baseBrutality,
                                    cunning: player.attributes.baseCunning,
                                    deceit: player.attributes.baseDeceit,
                                    madness: player.attributes.baseMadness
                                });
                                setCurrentAction(Actions[changeCurrentAction("exploring")]);
                                break;
                            }
                            default:
                                if (config.debug) {
                                    throw new Error(`Action ${getGlobalState().currentAction} not supported.`);
                                } else {
                                    setCurrentEncounter();
                                    setCurrentAction(Actions[changeCurrentAction("exploring")]);
                                    setActionLog([]);
                                }
                        }
                    }
                setDisplayedTime(accruedTime.current);
                const passedTime = timestamp - lastTime;
                const adjustedTime = passedTime * (manualSpeedUpActive.current ? getManualSpeedMultiplier() : 1);
                if (Math.min(accruedTime.current + adjustedTime, actionDuration) === 0) {
                    if (accruedTime.current + adjustedTime === 0) {
                        debugMessage(`Timestamp ${timestamp}, last time ${lastTime}`);
                    } else {
                        debugMessage("Action duration was 0");
                    }

                }
                accruedTime.current = Math.min(accruedTime.current + adjustedTime, actionDuration);
            }
            if (lastTime === timestamp) {
                debugMessage("New and previous timestamp were identical");
            }
            lastTime = timestamp;
            lastFrame = requestAnimationFrame(tick);
            setActionLog([...getGlobalState().actionLog]);
        }

        console.log("Adventuring Page");
        lastFrame = requestAnimationFrame(tick)
        return () => {
            console.log("Cancel frame");
            cancelAnimationFrame(lastFrame);
        }
    }, []);
    return <div className="App" style={styles.root}
                onMouseOver={() => manualSpeedUpActive.current = true}
                onMouseLeave={() => manualSpeedUpActive.current = false}
    >
        <div id="background" style={{
            position: "absolute",
            zIndex: "-10",
            overflow: "hidden",
            height: "100vh",
            width: "100vw"
        }}>
            <img style={styles.background} src={"./backgrounds/parallax-demon-woods-bg.png"}/>
            <img style={styles.image} src={"./backgrounds/parallax-demon-woods-far-trees.png"}/>
            <img style={styles.image} src={"./backgrounds/parallax-demon-woods-mid-trees.png"}/>
            <img style={styles.image} src={"./backgrounds/parallax-demon-woods-close-trees.png"}/>
        </div>
        <PlayerStats player={player} enemy={enemy}/>
        <div style={{display: "flex", flex: "1 0 auto", maxHeight: "100%", flexDirection: "column"}}>
            <TopSection character={player} automaticReincarnateEnabled={getGlobalState().automaticReincarnate}/>
            <BottomSection state={getGlobalState()} actionLog={actionLog}
                           player={player}
                           enemy={enemy}
                           togglePause={togglePause}
                           paused={paused}
                           nextActionName={nextAction}
                           currentAction={currentAction}
                           setNextAction={(newAction) => {
                               setNextAction(getGlobalState().nextAction = newAction);
                           }}
                           actionTime={displayedTime}
                           startManualSpeedup={props.startManualSpeedup}
                           stopManualSpeedup={props.stopManualSpeedup}
                           togglePause={p => setPaused(p)}
            />
        </div>
        <EnemySidebar player={player} enemy={enemy}/>

    </div>
}

function wrapLogItem(item) {
    return {
        uuid: v4(),
        ...item
    }
}