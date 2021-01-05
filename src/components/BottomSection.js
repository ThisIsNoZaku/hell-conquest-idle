import Paper from "@material-ui/core/Paper";
import React, {useEffect, useRef, useState} from "react";
import * as _ from "lodash";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import {evaluateExpression, getCharacter, getGlobalState} from "../engine";
import Grid from "@material-ui/core/Grid";
import {config} from "../config";
import {Decimal} from "decimal.js";
import CharacterCombatSummary from "./CharacterCombatSummary";
import ActionLog from "./ActionLog";

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
    },
    combat: {}
}
export default function BottomSection(props) {
    if (!props.currentAction) {
        throw new Error("No current action");
    }
    const escapeChance = props.enemy ? evaluateExpression(config.encounters.chanceToEscapeGreater, {
        player: props.player,
        enemy: props.enemy
    }) : Decimal(100);
    const intimidateChance = props.enemy ? evaluateExpression(config.encounters.chanceToIntimidateLesser, {
        player: props.player,
        enemy: props.enemy
    }) : Decimal(100);
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
            {actionButton("fleeing", "Flee", `Attempt to escape. Your chance is  ${escapeChance}%.`, props)}
            {actionButton("intimidating", "Intimidate", `Try to cow the enemy, compelling them to continuously provide you a portion of their life force. Your chance is ${intimidateChance}%`, props)}
            {_.get(config, "features.negotiating.enabled") && actionButton("negotiating", "Negotiate", "Combat the enemy. On victory, steal some of the power of the vanquished foe.", props)}
        </Paper>
        <Paper style={styles.combat.details}>
            <Grid container>
                <CharacterCombatSummary name="Player" currentHp={props.player.currentHp}
                                        maximumHp={props.player.maximumHp}
                                        statuses={_.get(props.player, "statuses")}
                                        direction="row"/>
                <CharacterCombatSummary name={_.get(props.enemy, "name")} currentHp={_.get(props.enemy, "currentHp", Decimal(0))}
                                        maximumHp={_.get(props.enemy, "maximumHp", Decimal(100))}
                                        statuses={_.get(props.enemy, "statuses")}
                                        direction="row-reverse"
                                        isRival={_.get(props.enemy, "isRival")}
                />
            </Grid>
        </Paper>
        <Paper style={styles.action}>
            <strong>{props.currentAction.description}</strong>
            <progress style={styles.actionProgress} value={props.actionTime}
                      max={_.get(props.state, props.currentAction.duration)}/>
        </Paper>
        <ActionLog actionLog={props.actionLog}/>
    </div>
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