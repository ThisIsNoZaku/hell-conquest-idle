import {CharacterSidebar} from "../adventuring/CharacterSidebar";
import TopSection from "../adventuring/TopSection";
import {
    getCharacter,
    getGlobalState,
    getManualSpeedMultiplier,
    saveGlobalState
} from "../../engine";
import BottomSection from "../adventuring/BottomSection";
import React, {useEffect, useRef, useState} from "react";
import * as _ from "lodash";
import {getConfigurationValue} from "../../config";
import {Actions} from "../../data/Actions";
import {debugMessage} from "../../debugging";
import {v4} from "node-uuid";
import {useHotkeys} from "react-hotkeys-hook";
import generateRoundActionLogItems from "../../engine/general/generateRoundActionLogItems";
import * as JOI from "joi";
import {EventHandlers} from "../../engine/EventHandlers";
import {Regions} from "../../data/Regions";
import {Timer} from "@material-ui/icons";
import {CharacterSheet} from "../adventuring/CharacterSheet";

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
        height: "75%",
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

const logItemSchema = JOI.object(
    {
        message: JOI.string().required(),
        uuid: JOI.string().guid().required()
    }
);

function pushLogItem(item) {
    if (typeof item === "string") {
        item = {
            message: item,
            uuid: v4()
        }
    }
    const validationResult = logItemSchema.validate(item);
    if (validationResult.error) {
        throw new Error(`Log item invalid: ${validationResult.error}`);
    }
    if (getGlobalState().actionLog.length > (getConfigurationValue("action_log_max_size") || 10)) {
        getGlobalState().actionLog.pop();
    }
    getGlobalState().actionLog.unshift(item);
}

export const TimerContext = React.createContext(0);
export const PlayerContext = React.createContext(getCharacter(0));
export const EnemyContext = React.createContext();

export default function AdventuringPage(props) {
    const [accruedTime, setAccruedTime] = useState(0);
    const [enemy, setEnemy] = useState(_.get(getGlobalState(), ["currentEncounter", "enemies", 0]));
    const [actionLog, setActionLog] = useState(getGlobalState().actionLog);
    const [currentAction, setCurrentAction] = useState(Actions[getGlobalState().currentAction]);
    const [nextAction, setNextAction] = useState(getGlobalState().nextAction);
    const [paused, setPaused] = useState(getGlobalState().paused);
    const player = useRef(getCharacter(0));
    const currentRegion = Regions[getGlobalState().currentRegion];

    function togglePause() {
        getGlobalState().paused = !getGlobalState().paused;
        setPaused(getGlobalState().paused);
    }

    useHotkeys("p", () => getGlobalState().paused = !getGlobalState().paused);

    useEffect(() => {
        let lastFrame;

        function applyAction(round) {
            const roundMessages = generateRoundActionLogItems(round);
            roundMessages.forEach(message => pushLogItem(message));
            round.events.forEach(event => {
                const sourceCharacter = event.source !== null ? getCharacter(event.source.character) : undefined;
                const targetCharacter = event.target ? getCharacter(event.target) : undefined;
                const eventHandler = EventHandlers[event.event];
                switch (event.event) {
                    case "kill":
                        eventHandler(event, sourceCharacter, targetCharacter, pushLogItem);
                        break;
                }
            });
            saveGlobalState();
        }

        function tick(timestamp) { // FIXME: Optimize, serious performance bottleneck
            if (!lastTime) {
                lastTime = timestamp;
            } else if (!getGlobalState().paused) {
                const actionDuration = Actions[getGlobalState().currentAction].duration;
                if (getGlobalState().time >= actionDuration) {
                    saveGlobalState();
                    setAccruedTime(getGlobalState().time = 0);
                    const nextAction = getGlobalState().nextAction;
                    getGlobalState().nextAction = undefined;

                    const candidateNextAction = Actions[getGlobalState().currentAction].complete(
                        props.rng,
                        getCharacter(0),
                        pushLogItem,
                        setPaused,
                        setEnemy,
                        applyAction,
                        setActionLog,
                        nextAction
                    );
                    debugMessage(`Completed ${getGlobalState().currentAction}`);
                    if (!candidateNextAction) {
                        throw new Error(`No next action after completing ${getGlobalState().currentAction}`);
                    }
                    if (_.isArray(candidateNextAction)) {
                        const currentAction = getGlobalState().currentAction = candidateNextAction[0];
                        setCurrentAction(Actions[currentAction]);
                        setNextAction(getGlobalState().nextAction = candidateNextAction[1]);
                    } else {
                        const currentAction = getGlobalState().currentAction = candidateNextAction;
                        setCurrentAction(Actions[currentAction]);
                    }
                    debugMessage(`Current Action now: ${getGlobalState().currentAction} Next: ${getGlobalState().nextAction}`);
                }
                const passedTime = timestamp - lastTime;
                const adjustedTime = passedTime;
                if (Math.min(accruedTime + adjustedTime, actionDuration) === 0) {
                    if (accruedTime + adjustedTime === 0) {
                        debugMessage(`Timestamp ${timestamp}, last time ${lastTime}`);
                    } else {
                        debugMessage("Action duration was 0");
                    }

                }
                const newTime = Math.min(getGlobalState().time + adjustedTime, actionDuration);
                console.log(newTime);
                setAccruedTime(getGlobalState().time = newTime);
            }
            if (lastTime === timestamp) {
                debugMessage("New and previous timestamp were identical");
            }
            lastTime = timestamp;
            lastFrame = requestAnimationFrame(tick);
        }

        console.log("Adventuring Page");
        lastFrame = requestAnimationFrame(tick)
        return () => {
            console.log("Cancel frame");
            cancelAnimationFrame(lastFrame);
        }
    }, []);
    return <div className="App" style={styles.root}>
        <div id="background" style={{
            position: "absolute",
            zIndex: "-10",
            overflow: "hidden",
            height: "100vh",
            width: "100vw"
        }}>
            <img style={styles.background} src={currentRegion.background.background}/>
            {currentRegion.background.far && <img style={styles.image} src={currentRegion.background.far}/>}
            {currentRegion.background.mid && <img style={styles.image} src={currentRegion.background.mid}/>}
            {currentRegion.background.close && <img style={styles.image} src={currentRegion.background.close}/>}
        </div>
        <PlayerContext.Provider value={player.current}>
            <EnemyContext.Provider value={enemy}>
                <CharacterSheet isPc={true}/>
            </EnemyContext.Provider>
        </PlayerContext.Provider>
        <div style={{display: "flex", flex: "1 0 auto", maxHeight: "100%", width: "60%", flexDirection: "column"}}>
            <TopSection highestLevelEnemyDefeated={player.current.highestLevelEnemyDefeated}
                        automaticReincarnateEnabled={getGlobalState().automaticReincarnate}
                        reincarnateEnabled={player.current.powerLevel.gt(1) || !player.current.isAlive || _.get(getGlobalState(), ["debug", "forceEnableReincarnate"], false)}
            />
            <TimerContext.Provider value={accruedTime}>
                <BottomSection state={getGlobalState()} actionLog={actionLog}
                               player={player.current}
                               enemy={enemy}
                               togglePause={togglePause}
                               paused={paused}
                               nextActionName={nextAction}
                               currentAction={currentAction}
                               setNextAction={(newAction) => {
                                   setNextAction(getGlobalState().nextAction = newAction);
                               }}
                               startManualSpeedup={props.startManualSpeedup}
                               stopManualSpeedup={props.stopManualSpeedup}
                               togglePause={p => setPaused(p)}
                />
            </TimerContext.Provider>
        </div>
        <PlayerContext.Provider value={player.current}>
            <EnemyContext.Provider value={enemy}>
                <CharacterSheet isPlayer={false}/>
            </EnemyContext.Provider>
        </PlayerContext.Provider>

    </div>
}