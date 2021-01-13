import PlayerStats from "../adventuring/PlayerStats";
import TopSection from "../adventuring/TopSection";
import {
    getCharacter,
    getGlobalState,
    getManualSpeedMultiplier, reincarnateAs,
    saveGlobalState
} from "../../engine";
import BottomSection from "../adventuring/BottomSection";
import EnemySidebar from "../adventuring/EnemySidebar";
import React, {useEffect, useRef, useState} from "react";
import * as _ from "lodash";
import {config} from "../../config";
import {Actions} from "../../data/Actions";
import {debugMessage} from "../../debugging";
import {v4} from "node-uuid";
import {useHotkeys} from "react-hotkeys-hook";
import generateRoundActionLogItems from "../../engine/general/generateRoundActionLogItems";
import * as JOI from "joi";
import {EventHandlers} from "../../engine/EventHandlers";

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

const logItemSchema = JOI.object(
    {
        message: JOI.string().required(),
        uuid: JOI.string().guid().required()
    }
);

function pushLogItem(item) {
    if(typeof item === "string") {
        item = {
            message: item,
            uuid: v4()
        }
    }
    const validationResult = logItemSchema.validate(item);
    if(validationResult.error) {
        throw new Error(`Log item invalid: ${validationResult.error}`);
    }
    if (getGlobalState().actionLog.length > (config.actionLog.maxSize || 10)) {
        getGlobalState().actionLog.pop();
    }
    getGlobalState().actionLog.unshift(item);
}

export default function AdventuringPage(props) {
    const accruedTime = useRef(0);
    const [enemy, setEnemy] = useState(_.get(getGlobalState(), ["currentEncounter", "enemies", 0]));
    const [actionLog, setActionLog] = useState(getGlobalState().actionLog);
    const [currentAction, setCurrentAction] = useState(Actions[getGlobalState().currentAction]);
    const [nextAction, setNextAction] = useState(getGlobalState().nextAction);
    const [paused, setPaused] = useState(getGlobalState().paused);
    const [displayedTime, setDisplayedTime] = useState(0);
    const [player, setPlayer] = useState(getCharacter(0));
    const manualSpeedUpActive = useRef(false);

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
                const sourceCharacter = event.source !== undefined ? getCharacter(event.source) : undefined;
                const targetCharacter = getCharacter(event.target);
                const eventHandler = EventHandlers[event.event];
                switch (event.event) {
                    case "combat-end":
                    case "kill":
                    case "damage":
                    case "fatigue-damage":
                    case "add-status":
                    case "remove-status":
                        eventHandler(event, sourceCharacter, targetCharacter, pushLogItem);
                        break;
                    case "hit":
                        if(event.precisionUsed) {
                            const originalPrecisionPoints = sourceCharacter.combat.precisionPoints; 
                            sourceCharacter.combat.precisionPoints = sourceCharacter.combat.precisionPoints.minus(event.precisionUsed);
                            debugMessage(`Precision points for ${sourceCharacter.id} changed from ${originalPrecisionPoints.toFixed()} to ${sourceCharacter.combat.precisionPoints.toFixed()}`);
                        }
                        if(event.evasionUsed) {
                            const originalevasionPoints = targetCharacter.combat.evasionPoints;
                            targetCharacter.combat.evasionPoints = targetCharacter.combat.evasionPoints.minus(event.evasionUsed);
                            debugMessage(`evasion points for ${targetCharacter.id} changed from ${originalevasionPoints.toFixed()} to ${targetCharacter.combat.evasionPoints.toFixed()}`);
                        }
                        break;
                    case "action_skipped":
                        break;
                    default:
                        throw new Error(`No handling for ${event.event}.`);
                }
            });
            saveGlobalState();
        }

        function tick(timestamp) { // FIXME: Optimize, serious performance bottleneck
            if (!lastTime) {
                lastTime = timestamp;
            } else if (!getGlobalState().paused) {
                const actionDuration = typeof Actions[getGlobalState().currentAction].duration === "number" ?
                    Actions[getGlobalState().currentAction].duration : _.get(getGlobalState(), Actions[getGlobalState().currentAction].duration);
                if (accruedTime.current >= actionDuration) {
                    saveGlobalState();
                    accruedTime.current = 0;
                    const nextAction = getGlobalState().nextAction;

                    const currentAction = getGlobalState().currentAction = nextAction;
                    setCurrentAction(Actions[currentAction]);
                    const candidateNextAction = Actions[currentAction].complete(
                        props.rng,
                        getCharacter(0),
                        pushLogItem,
                        setPaused,
                        setEnemy,
                        applyAction,
                        setActionLog,
                        nextAction
                    );
                    setNextAction(getGlobalState().nextAction = candidateNextAction !== undefined ? candidateNextAction : getGlobalState().nextAction);

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

function endCombat() {

}