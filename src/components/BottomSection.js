import Paper from "@material-ui/core/Paper";
import React, {useRef} from "react";
import * as _ from "lodash";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import {getCharacter, getGlobalState} from "../engine";

const styles = {
    root: {
        display: "flex",
        flex: "1 0 auto",
        justifyContent: "flex-end",
        flexDirection: "column"
    },
    actions: {
        container: {
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row"
        },
        buttons: {
            alignSelf: "flex-end",
            flex: "1"
        }
    },
    action: {
        maxHeight: "15%",
        width: "100%",
        display: "flex",
        flexDirection: "column"
    },
    actionProgress: {
        width: "100%"
    },
    history: {
        height: "15%",
        flexDirection: "column",
        overflowY: "scroll"
    }
}
export default function BottomSection(props) {
    if (!props.currentAction) {
        throw new Error("No current action");
    }
    const paused = useRef(getGlobalState().paused);
    return <div style={styles.root} onMouseEnter={props.startManualSpeedup} onMouseLeave={props.stopManualSpeedup}>
        <Paper style={styles.actions.container}>
            <Button style={styles.actions.buttons} onClick={() => getGlobalState().paused = !getGlobalState().paused }>
                { paused.current ? "Unpause" : "Pause"}
            </Button>
        </Paper>
        <Paper style={styles.actions.container} >
            {actionButton("fighting", "Fight", "Combat the enemy. On victory, steal some of the power of the vanquished foe.", props)}
            {actionButton("fleeing", "Flee", "Attempt to escape. You will automatically escape from Greater Demons.", props)}
            {actionButton("intimidating", "Intimidate", "Combat the enemy. On victory, steal some of the power of the vanquished foe.", props)}
            {actionButton("negotiating", "Negotiate", "Combat the enemy. On victory, steal some of the power of the vanquished foe.", props)}
        </Paper>
        <Paper style={styles.action}>
            <strong>{props.currentAction.description}</strong>
            <progress style={styles.actionProgress} value={props.actionTime}
                      max={_.get(props.state, props.currentAction.duration)}/>
        </Paper>
        <Paper style={styles.history}>
            {
                props.actionLog.map(item => printActionItem(item))
            }
        </Paper>
    </div>
}

function printActionItem(item) {
    switch (item.result) {
        case "hit":
            return <div key={item.uuid}>
                {`${item.tick}: ${getCharacter(item.actor).name} hit! ${item.effects.map(effect => describeEffect(item.target, effect))}`}
            </div>
        case "miss":
            return <div key={item.uuid}>
                {`${item.tick}: ${getCharacter(item.actor).name} Missed! ${item.effects.map(effect => describeEffect(item.target, effect))}`}
            </div>
        case "kill":
            return <div key={item.uuid}>
                <strong>{getCharacter(item.actor).name === "You" ? `${item.tick}:${getCharacter(item.target).name} Were Killed!` : `${item.tick}:${getCharacter(item.target).name} Was Killed!`}</strong>
            </div>
        case "gainedPower":
            return <div key={item.uuid}>
                You absorbed {item.value} power.
            </div>
        case "healed":
            return <div key={item.uuid}>
                {`${getCharacter(item.target).name} gained ${item.value} health.`}
            </div>
        case "escaped":
            return <div key={item.uuid}>
                You escaped.
            </div>
    }

}

function describeEffect(target, effect) {
    switch (effect.event) {
        case "damage":
            return `${getCharacter(target).name} takes ${effect.value} Damage.`;
    }
}

function actionButton(action, text, description, props) {
    return <Tooltip title={description}>
        <Button onClick={() => props.setNextAction(action)} style={styles.actions.buttons} disabled={props.currentAction.id !== "approaching"}
                variant={props.nextActionName === action ? "contained" : "outlined"}
                color={props.nextActionName === action ? "primary" : "default"}>
            { text }
        </Button>
    </Tooltip>
}