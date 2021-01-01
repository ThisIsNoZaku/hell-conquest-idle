import './App.css';
import {v4} from "node-uuid";
import * as _ from "lodash";
import React, {useEffect, useRef, useState} from "react";
import 'react-circular-progressbar/dist/styles.css';
import {Regions} from "./data/Regions";
import {Actions} from "./data/Actions";
import {Decimal} from "decimal.js";
import {
    evaluateExpression,
    getCharacter,
    getGlobalState, getManualSpeedMultiplier,
    loadGlobalState, reincarnateAs,
    saveGlobalState, unpause
} from "./engine";
import * as seedrandom from "seedrandom";
import {config} from "./config";
import {MemoryRouter, Route, Switch} from "react-router-dom";
import ReincarnationSelectionPage from "./components/scene/ReincarnationSelectionPage";
import AdventuringPage from "./components/scene/AdventuringPage";
import DebugUi from "./components/DebugUi";
import {useHotkeys} from "react-hotkeys-hook";
import {debugMessage} from "./debugging";
import SplashPage from "./components/scene/SplashPage";
import {resolveCombat} from "./engine/combat";

loadGlobalState();

const rng = seedrandom();

let lastTime;

function changeCurrentAction(newAction) {
    getGlobalState().currentAction = newAction;
    return getGlobalState().currentAction;
}

function pushLogItem(item) {
    if (getGlobalState().actionLog.length > (config.actionLog.maxSize || 10)) {
        getGlobalState().actionLog.pop();
    }
    getGlobalState().actionLog.unshift(item);
}


function App() {
    const [currentEncounter, setCurrentEncounter] = useState(getGlobalState().currentEncounter);
    const accruedTime = useRef(0);
    const manualSpeedUpActive = useRef(false);
    const [displayedTime, setDisplayedTime] = useState(0);
    const [currentAction, setCurrentAction] = useState(Actions[getGlobalState().currentAction]);
    const [actionLog, setActionLog] = useState(getGlobalState().actionLog);
    const [nextAction, setNextAction] = useState(getGlobalState().nextAction);
    const player = useRef(getCharacter(0));
    const [debugUiEnabled, setDebugUiEnabled] = useState(false);
    const [paused, setPaused] = useState(getGlobalState().paused);

    useHotkeys("p", () => getGlobalState().paused = !getGlobalState().paused);
    useHotkeys("`", () => {
        setDebugUiEnabled(enabled => {
            if (config.debug) {
                if (!enabled) {
                    getGlobalState().paused = true;
                    setPaused(getGlobalState().paused);
                }
                saveGlobalState();
                return !enabled
            } else {
                return false;
            }
        });
    });

    useEffect(() => {
        function applyAction(action) {
            pushLogItem(action);
            switch (action.result) {
                case "combat-end":
                    if (config.mechanics.artifacts.enabled) {
                        setCurrentAction(Actions[changeCurrentAction("looting")]);
                    } else {
                        setCurrentAction(Actions[changeCurrentAction("exploring")]);
                    }
                    setCurrentEncounter(getGlobalState().currentEncounter = null);
                    break;
                case "kill":
                    if (getGlobalState().currentEncounter.pendingActions[0].result === "combat-end") {
                        if (getCharacter(0).isDamaged) {
                            getGlobalState().nextAction = "healing";
                            setNextAction(getGlobalState().nextAction);
                        }
                        applyAction(getGlobalState().currentEncounter.pendingActions.shift());
                    }
                    const enemy = getCharacter(action.target);
                    const enemyIsLesserDemon = getCharacter(0).otherDemonIsLesserDemon(enemy);
                    if (enemyIsLesserDemon) {
                        debugMessage(`Not gaining power because enemy ${action.target} was a Lesser Demon.`);
                    }
                    if (action.actor === 0 && action.target !== 0 && !enemyIsLesserDemon) {
                        debugMessage("Player killed a non-lesser enemy and gained power.");
                        const player = getCharacter(0);
                        const powerToGain = evaluateExpression(config.mechanics.xp.gainedFromOtherDemon, {
                            enemy: getCharacter(action.target)
                        });
                        const powerGained = player.gainPower(powerToGain);
                        pushLogItem(wrapLogItem({
                            result: "gainedPower",
                            value: powerGained
                        }));
                        getGlobalState().highestLevelReached = Decimal.max(getGlobalState().highestLevelReached, getCharacter(0).powerLevel);
                    } else if (action.target === 0) {
                        setCurrentAction(getGlobalState().currentAction = "reincarnating");
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
                                if (getGlobalState().currentEncounter.pendingActions[0].result === "kill") {
                                    applyAction(getGlobalState().currentEncounter.pendingActions.shift());
                                }
                                break;
                            case "apply_effect":
                                targetCharacter.addModifier({
                                    effect: effect.effect,
                                    magnitude: effect.value
                                });
                                break;
                        }
                    });
                    break;
                case "action_skipped":
                    break;
                default:
                    throw new Error();
            }
            saveGlobalState();
        }

        function clearActionLog() {
            setActionLog(getGlobalState().actionLog = []);
        }

        function tick(timestamp) {
            if (!lastTime) {
                lastTime = timestamp;
            } else if (!getGlobalState().paused) {
                if (accruedTime.current >= _.get(getGlobalState(), Actions[getGlobalState().currentAction].duration)) {
                    saveGlobalState();
                    accruedTime.current = 0;
                    switch (getGlobalState().currentAction) {
                        case "exploring":
                            let proceedingToEncounter = false;
                            if (getCharacter(0).currentHp.lt(getCharacter(0).maximumHp)) {
                                setCurrentAction(Actions[changeCurrentAction("recovering")]);
                                const amountToHeal = getCharacter(0).currentHp.plus(getCharacter(0).healing).gt(
                                    getCharacter(0).maximumHp
                                ) ? getCharacter(0).maximumHp.minus(getCharacter(0).currentHp) : getCharacter(0).healing;
                                getCharacter(0).currentHp = getCharacter(0).currentHp.plus(amountToHeal);
                                pushLogItem({
                                    target: player.id,
                                    value: amountToHeal,
                                    result: "healed",
                                    uuid: v4()
                                })
                                // TODO: Implement random encounter chance
                                const encounterChance = evaluateExpression(config.mechanics.combat.randomEncounterChance, {});
                                const encounterRoll = Math.floor(rng.double() * 100) + 1;
                                debugMessage(`Determining if encounter occurs. Chance ${encounterChance} vs roll ${encounterRoll}.`);
                                if (encounterRoll <= encounterChance.toNumber()) {
                                    proceedingToEncounter = true;
                                }
                            } else {
                                proceedingToEncounter = true;
                            }
                            if (proceedingToEncounter) {
                                const player = getCharacter(0);
                                getGlobalState().currentEncounter = Regions[getGlobalState().currentRegion].startEncounter(getCharacter(0), rng);
                                setCurrentEncounter(getGlobalState().currentEncounter);
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
                                clearActionLog();
                                if (getGlobalState().passivePowerIncome.gt(0)) {
                                    const gainedPower = getCharacter(0).gainPower(getGlobalState().passivePowerIncome);
                                    pushLogItem({
                                        message: `Your Bound lesser demons grant you ${gainedPower.toFixed()} power.`,
                                        uuid: v4()
                                    });
                                    getGlobalState().highestLevelReached = Decimal.max(getGlobalState().highestLevelReached, getCharacter(0).powerLevel);
                                }

                                const enemies = getGlobalState().currentEncounter.enemies;
                                if (player.otherDemonIsGreaterDemon(enemies[0])) {
                                    pushLogItem({
                                        message: `💀Approaching Greater ${enemies[0].name}.💀`,
                                        uuid: v4()
                                    });
                                } else if (player.otherDemonIsLesserDemon(enemies[0])) {
                                    pushLogItem({
                                        message: `Approaching Lesser ${enemies[0].name}.`,
                                        uuid: v4()
                                    });
                                } else {
                                    pushLogItem({
                                        message: `Approaching ${enemies[0].name}.`,
                                        uuid: v4()
                                    });
                                }
                                saveGlobalState();
                            }
                            break;
                        case "approaching": {
                            // Since we're starting a new combat, remove any old, dead characters
                            const player = getCharacter(0);
                            switch (getGlobalState().nextAction) {
                                case "fighting":
                                    const enemies = getGlobalState().currentEncounter.enemies;
                                    const combatResult = resolveCombat(rng, {
                                        parties: [[player], enemies]
                                    });
                                    getGlobalState().currentEncounter.pendingActions = combatResult.rounds;

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
                            const chanceToIntimidate = evaluateExpression(config.encounters.chanceToIntimidateLesser, {
                                enemy,
                                player: getCharacter(0)
                            });
                            const roll = Math.floor(rng.double() * 100) + 1;
                            if (chanceToIntimidate.gte(roll)) {
                                const periodicPowerIncreases = evaluateExpression(config.mechanics.xp.gainedFromLesserDemon, {
                                    enemy
                                });
                                pushLogItem(wrapLogItem({
                                    result: "intimidated",
                                    target: enemy.id,
                                    value: periodicPowerIncreases
                                }));
                                getGlobalState().passivePowerIncome = getGlobalState().passivePowerIncome.plus(periodicPowerIncreases);
                            } else {
                                pushLogItem(wrapLogItem({
                                    message: `${getCharacter(enemy.id).name} escaped! (You rolled ${roll} vs ${chanceToIntimidate} chance to Bind).`
                                }));
                                setCurrentEncounter(getGlobalState().currentEncounter = null);
                            }
                            setCurrentAction(Actions[changeCurrentAction("exploring")]);
                            break;
                        }
                        case "fleeing":
                            const player = getCharacter(0);
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
                                    $enemy: enemy
                                });
                                const powerGained = player.gainPower(powerToGain);
                                getGlobalState().highestLevelReached = Decimal.max(getGlobalState().highestLevelReached, getCharacter(0).powerLevel);
                                pushLogItem(wrapLogItem({
                                    result: "gainedPower",
                                    value: powerGained,
                                }));
                                getGlobalState().currentEncounter = null;
                                setCurrentEncounter(null);
                                setCurrentAction(Actions[changeCurrentAction("exploring")]);
                            } else {
                                pushLogItem({
                                    message: `The Greater ${enemy.name} caught you!`,
                                    uuid: v4()
                                });
                                setCurrentAction(Actions[changeCurrentAction("fighting")]);
                            }

                            break;
                        case "fighting" : {
                            if (getGlobalState().currentEncounter.pendingActions.length) {
                                const nextAction = getGlobalState().currentEncounter.pendingActions.shift();
                                applyAction(nextAction);
                                setActionLog([...getGlobalState().actionLog]);
                            } else {
                                setCurrentAction(Actions[changeCurrentAction("fleeing")]);
                            }
                            break;
                        }
                        case "looting":
                            const lootRoll = Math.floor(rng.double() * 666);
                            if (lootRoll <= getGlobalState().currentEncounter.encounterLevel) {

                            }
                            setCurrentAction(Actions[changeCurrentAction("exploring")]);
                            break;
                        case "reincarnating":
                            setCurrentEncounter();
                            setCurrentAction(Actions[changeCurrentAction("exploring")]);
                            setActionLog([]);
                            getGlobalState().actionLog = [];
                            break;
                        default:
                            throw new Error(`Action ${getGlobalState().currentAction} not supported.`);
                    }
                }

                setDisplayedTime(accruedTime.current);
                const passedTime = timestamp - lastTime;
                const adjustedTime = passedTime * (manualSpeedUpActive.current ? getManualSpeedMultiplier() : 1);
                accruedTime.current = Math.min(accruedTime.current + adjustedTime, _.get(getGlobalState(), Actions[getGlobalState().currentAction].duration));
            }
            lastTime = timestamp;
            requestAnimationFrame(tick);
            setActionLog([...getGlobalState().actionLog]);
        }

        requestAnimationFrame(tick)
    }, []);

    return (
        <MemoryRouter initialEntries={[
            getGlobalState().currentAction === "reincarnating" ? "/reincarnating" : (
                getGlobalState().currentAction === "adventuring" ? "/adventuring" : "/")
        ]} basename="%PUBLIC_URL%">
            <Switch>
                <Route path="/" exact>
                    <SplashPage/>
                </Route>
                <Route path="/reincarnating" exact>
                    <ReincarnationSelectionPage reincarnate={(monster, attributes) => {
                        reincarnateAs(monster, attributes);
                        setCurrentAction(getGlobalState().currentAction);
                        unpause();
                        setPaused(false);
                        accruedTime.current = 10000000;
                    }}/>
                </Route>
                <Route path="/adventuring" exact>
                    <AdventuringPage player={player.current}
                                     paused={paused}
                                     togglePause={(newValue) => setPaused(newValue)}
                                     setNextAction={newAction => setNextAction(newAction)}
                                     actionTime={displayedTime}
                                     currentEncounter={currentEncounter}
                                     startManualSpeedup={() => {
                                         manualSpeedUpActive.current = config.manualSpeedup.enabled;
                                     }}
                                     stopManualSpeedup={() => {
                                         manualSpeedUpActive.current = false
                                     }}
                                     currentAction={currentAction}
                                     nextAction={nextAction}
                                     actionLog={actionLog}
                    />
                </Route>
            </Switch>
            {debugUiEnabled && <DebugUi/>}
        </MemoryRouter>
    );
}

export default App;

function wrapLogItem(item) {
    return {
        uuid: v4(),
        ...item
    }
}