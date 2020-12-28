import Paper from "@material-ui/core/Paper";
import React, {useEffect, useRef, useState} from "react";
import * as _ from "lodash";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import {getCharacter, getGlobalState} from "../engine";
import Grid from "@material-ui/core/Grid";

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
    return <div style={styles.root} onMouseEnter={props.startManualSpeedup} onMouseLeave={props.stopManualSpeedup}>
        <Paper style={styles.actions.container}>
            <Button style={styles.actions.buttons} onClick={() => {
                getGlobalState().paused = !getGlobalState().paused;
                props.togglePause(getGlobalState().paused);
            }}>
                {props.paused ? "Unpause" : "Pause"}
            </Button>
        </Paper>
        <Paper style={styles.actions.container}>
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
    if (item.message) {
        return <Grid item xs={12} key={item.uuid} style={{textAlign: "center"}}>
            <Grid item xs={1}></Grid>
            <Grid item xs={11}>
            <span dangerouslySetInnerHTML={{
                __html: item.message
            }}></span>
            </Grid>
        </Grid>
    } else {
        switch (item.result) {
            case "apply_effect":
                return <Grid container item xs={12} key={item.uuid}>
                    <Grid item xs={1}>{item.tick}:</Grid>
                    <Grid item xs={11}>{`${getCharacter(item.actor).name}`}</Grid>
                </Grid>
            case "hit":
                return <Grid container xs={12} key={item.uuid}>
                    <Grid item xs={1}>{item.tick}:</Grid>
                    <Grid item
                          xs={11}>{getCharacter(item.actor).name} hit! {item.effects.map(effect => describeEffect(item.target, effect)).join(" ")}</Grid>
                </Grid>
            case "miss":
                return <Grid container item xs={12} key={item.uuid}>
                    <Grid item xs={1}>{item.tick}:</Grid>
                    <Grid item xs={11}>
                        {getCharacter(item.actor).name} Missed! {item.effects.map(effect => describeEffect(item.target, effect)).join(" ")}
                    </Grid>
                </Grid>
            case "kill":
                return <Grid container item xs={12} key={item.uuid}>
                    <Grid item xs={1}>{item.tick}:</Grid>
                    <Grid item
                          xs={11}><strong>{getCharacter(item.target).name} {item.target === 0 ? 'Were' : 'Was'} Killed!</strong></Grid>
                </Grid>
            case "gainedPower":
                return <Grid item xs={12} key={item.uuid}>
                    <Grid item xs={1}></Grid>
                    <Grid item xs={11}>
                        You absorbed {item.value.toFixed()} power.
                    </Grid>
                </Grid>
            case "healed":
                return <Grid item xs={12} key={item.uuid}>
                    <Grid item xs={1}></Grid>
                    <Grid item xs={11}>
                        {`${getCharacter(item.target).name} gained ${item.value} health.`}
                    </Grid>
                </Grid>
            case "escaped":
                return <Grid item xs={12} key={item.uuid}>
                    <Grid item xs={1}></Grid>
                    <Grid item xs={11}>
                        You escaped.
                    </Grid>
                </Grid>
        }
    }
}

function describeEffect(target, effect) {
    switch (effect.event) {
        case "damage":
            return `${getCharacter(target).name} ${target === 0 ? 'take' : 'takes'} ${effect.value} Damage.`;
        default:
            switch (effect.effect) {
                case "speed_modifier":
                    if(effect.value.lt(0)) {
                        return `${getCharacter(effect.target).name} ${effect.target === 0 ? 'suffer' : 'suffers'} a ${effect.value}% penalty to Speed.`;
                    } else {
                        return `${getCharacter(effect.target).name} ${effect.target === 0 ? 'gain' : 'gains'} a ${effect.value}% bonus to Speed.`;
                    }

            }

    }
}

function actionButton(action, text, description, props) {
    return <Tooltip title={description}>
        <Button onClick={() => props.setNextAction(action)} style={styles.actions.buttons}
                disabled={props.currentAction.id !== "approaching"}
                variant={props.nextActionName === action ? "contained" : "outlined"}
                color={props.nextActionName === action ? "primary" : "default"}>
            {text}
        </Button>
    </Tooltip>
}