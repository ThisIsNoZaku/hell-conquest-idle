import './App.css';
import {v4} from "node-uuid";
import * as _ from "lodash";
import {Canvas} from "react-three-fiber";
import React, {useEffect, useRef, useState} from "react";
import {Suspense} from "react";
import GameScreen from "./components/GameScreen";
import PlayerStats from "./components/PlayerStats";
import EnemySidebar from "./components/EnemySidebar";
import 'react-circular-progressbar/dist/styles.css';
import {Regions} from "./data/Regions";
import {Actions} from "./data/Actions";
import {
    getCharacter,
    getGlobalState, getLevelForPower,
    loadGlobalState, reincarnateAs,
    resolveCombat, saveGlobalState, unpause
} from "./engine";
import * as seedrandom from "seedrandom";
import BottomSection from "./components/BottomSection";
import {config} from "./config";
import {MemoryRouter, Route, Switch} from "react-router-dom";
import ReincarnationSelectionPage from "./components/scene/ReincarnationSelectionPage";
import {Big} from "big.js";
import TopSection from "./components/TopSection";
import AdventuringPage from "./components/scene/AdventuringPage";

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

    useEffect(() => {
        document.addEventListener("keydown", function (e) {
            if (e.code === "KeyP") {
                getGlobalState().paused = !getGlobalState().paused;
            }
        })
    }, []);

    useEffect(() => {
        function applyAction(action) {
            pushLogItem(action);
            switch (action.result) {
                case "combat-end":
                    if (player.current.currentHp < player.current.maximumHp) {
                        setCurrentAction(Actions[changeCurrentAction("recovering")]);
                    } else {
                        if (config.artifacts.enabled) {
                            setCurrentAction(Actions[changeCurrentAction("looting")]);
                        } else {
                            setCurrentAction(Actions[changeCurrentAction("exploring")]);
                        }
                    }
                    setCurrentEncounter(getGlobalState().currentEncounter = null);
                    break;
                case "kill":
                    if (getGlobalState().currentEncounter.pendingActions[0].result === "combat-end") {
                        applyAction(getGlobalState().currentEncounter.pendingActions.shift());
                    }
                    if (action.actor === getCharacter(0) && action.target !== getCharacter(0)) {
                        const player = getCharacter(0);
                        player.gainPower(getCharacter(action.target).powerLevel.mul(2));
                    }
                    break;
                case "hit":
                case "miss":
                    (action.effects || []).forEach(effect => {
                        switch (effect.event) {
                            case "damage":
                                const targetCharacter = getCharacter(effect.target);
                                targetCharacter.currentHp = targetCharacter.currentHp.minus(effect.value);
                                if (targetCharacter.currentHp.lt(Big(0))) {
                                    targetCharacter.currentHp = Big(0);
                                }
                                if (getGlobalState().currentEncounter.pendingActions[0].result === "kill") {
                                    applyAction(getGlobalState().currentEncounter.pendingActions.shift());
                                }
                                break;
                            default:
                                debugger;
                        }
                    });
                    break;
                default:
                    throw new Error();
            }
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
                            if (getCharacter(0).currentHp.lt(getCharacter(0).maximumHp)) {
                                setCurrentAction(Actions[changeCurrentAction("recovering")]);
                            } else {
                                getGlobalState().currentEncounter = Regions[getGlobalState().currentRegion].startEncounter(getCharacter(0), rng);
                                setCurrentEncounter(getGlobalState().currentEncounter);
                                setCurrentAction(Actions[changeCurrentAction("approaching")]);
                                getGlobalState().nextAction = getGlobalState().currentEncounter.enemies.reduce((actionSoFar, nextEnemy) => {
                                    if (actionSoFar !== "fighting") {
                                        return actionSoFar;
                                    }

                                    const playerPowerLevel = getCharacter(0).powerLevel;
                                    const lesserPowerLevel = playerPowerLevel.minus(config.encounters.lesserLevelScale);
                                    const greaterPowerLevel = playerPowerLevel.plus(config.encounters.greaterLevelScale);
                                    if (lesserPowerLevel.gte(nextEnemy.powerLevel)) {
                                        return "intimidating";
                                    } else if (greaterPowerLevel.lte(nextEnemy.powerLevel)) {
                                        return "fleeing";
                                    } else {
                                        return "fighting";
                                    }
                                }, "fighting");
                                setNextAction(getGlobalState().nextAction);
                                clearActionLog();
                            }
                            break;
                        case "approaching": {
                            const player = getCharacter(0);
                            setCurrentAction(Actions[changeCurrentAction(getGlobalState().nextAction)]);
                            switch (getGlobalState().nextAction) {
                                case "fighting":
                                    resolveCombat(rng, {
                                        parties: [[player], getGlobalState().currentEncounter.enemies]
                                    }).onRoundResolved((result, lastRound) => {
                                        if (lastRound !== undefined) {
                                            getGlobalState().currentEncounter.pendingActions.push(lastRound);
                                        }
                                    });
                                    break;
                            }
                            setNextAction();
                            break;
                        }
                        case "intimidating":
                            break;
                        case "fleeing":
                            const player = getCharacter(0);
                            player.gainPower(1);
                            getGlobalState().currentEncounter = null;
                            setCurrentEncounter(null);
                            setCurrentAction(Actions[changeCurrentAction("exploring")]);
                            pushLogItem({
                                result: "escaped",
                                uuid: v4()
                            });
                            pushLogItem({
                                result: "gainedPower",
                                value: 1,
                                uuid: v4()
                            });
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
                        case "recovering": {
                            const player = getCharacter(0);
                            if (player.currentHp.lt(player.maximumHp)) {
                                const amountToHeal = player.healing;
                                player.currentHp = player.currentHp.plus(amountToHeal);
                                pushLogItem({
                                    target: player.id,
                                    value: amountToHeal,
                                    result: "healed"
                                })
                            }
                            if (player.currentHp.gte(player.maximumHp)) {
                                setCurrentAction(Actions[changeCurrentAction("exploring")]);
                            }
                            break;
                        }
                        default:
                            throw new Error(`Action ${getGlobalState().currentAction} not supported.`);
                    }
                }

                setDisplayedTime(accruedTime.current);
                const passedTime = timestamp - lastTime;
                const adjustedTime = passedTime * (manualSpeedUpActive.current ? getGlobalState().manualSpeedMultiplier : 1);
                accruedTime.current = Math.min(accruedTime.current + adjustedTime, _.get(getGlobalState(), Actions[getGlobalState().currentAction].duration));
                lastTime = timestamp;
            }
            requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick)
    }, []);

    return (
        <MemoryRouter initialEntries={[
            getGlobalState().currentAction === "reincarnating" ? "/" : "/adventuring"
        ]}>
            <Switch>
                <Route path="/" exact>
                    <ReincarnationSelectionPage reincarnate={(monster) => {
                        reincarnateAs(monster);
                        getGlobalState().currentAction = "exploring";
                        setCurrentAction(getGlobalState().currentAction);
                        unpause();
                    }}/>
                </Route>
                <Route path="/adventuring" exact>
                    <AdventuringPage player={player.current}
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
        </MemoryRouter>
    );
}

export default App;
