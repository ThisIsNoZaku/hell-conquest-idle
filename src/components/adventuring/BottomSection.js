import Paper from "@material-ui/core/Paper";
import React from "react";
import * as _ from "lodash";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import {getGlobalState} from "../../engine";
import Grid from "@material-ui/core/Grid";
import {Decimal} from "decimal.js";
import CharacterCombatSummary from "./CharacterCombatSummary";
import ActionLog from "./ActionLog";
import ExplorationActionsSection from "./actions/ExplorationActionsSection";
import ApproachingActionsSection from "./actions/ApproachingActionsSection";

const styles = {
    root: {
        display: "flex",
        flex: "1 0 auto",
        justifyContent: "flex-end",
        flexDirection: "column",
    },
    actions: {
        container: {
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row"
        },
        buttons: {
            alignSelf: "flex-end",
            flex: "1",
            height: "100%"
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

    const maxActionTime = typeof props.currentAction.duration === "number" ?
        props.currentAction.duration :
        _.get(props.state, props.currentAction.duration);
    return <div style={styles.root} onMouseEnter={props.startManualSpeedup} onMouseLeave={props.stopManualSpeedup}>
        {props.currentAction.id === "exploring" && <ExplorationActionsSection {...props} />}
        {props.currentAction.id === "approaching" && <ApproachingActionsSection {...props} />}
        <Paper style={styles.actions.container}>
            <Button style={styles.actions.buttons} onClick={() => {
                getGlobalState().paused = !getGlobalState().paused;
                props.togglePause(getGlobalState().paused);
            }}>
                {props.paused ? "Unpause" : "Pause"}
            </Button>
        </Paper>
        <Paper style={styles.combat.details}>
            <Grid container>
                <CharacterCombatSummary name="Player" hp={props.player.hp}
                                        maximumHp={props.player.maximumHp}
                                        statuses={_.get(props.player, "statuses")}
                                        direction="row"
                                        evasionPoints={props.player.combat.evasionPoints.toNumber()}
                                        maxEvasionPoints={props.player.combat.maxEvasionPoints.toNumber()}
                                        precisionPoints={props.player.combat.precisionPoints.toNumber()}
                                        maxPrecisionPoints={props.player.combat.maxPrecisionPoints.toNumber()}
                                        stamina={props.player.combat.stamina}
                                        maxStamina={props.player.maximumStamina}
                />
                <CharacterCombatSummary name={_.get(props.enemy, "name")} hp={_.get(props.enemy, "hp", Decimal(0))}
                                        maximumHp={_.get(props.enemy, "maximumHp", Decimal(100))}
                                        statuses={_.get(props.enemy, "statuses")}
                                        direction="row-reverse"
                                        isRival={_.get(props.enemy, "isRival")}
                                        evasionPoints={_.get(props.enemy, ["combat", "evasionPoints"], Decimal(0)).toNumber()}
                                        maxEvasionPoints={_.get(props.enemy, ["combat", "maxEvasionPoints"], Decimal(0)).toNumber()}
                                        precisionPoints={_.get(props.enemy, ["combat", "precisionPoints"], Decimal(0)).toNumber()}
                                        maxPrecisionPoints={_.get(props.enemy, ["combat", "maxPrecisionPoints"], Decimal(0)).toNumber()}
                                        stamina={_.get(props.enemy, ["combat","stamina"], Decimal(0)).toNumber()}
                                        maxStamina={_.get(props.enemy, ["combat","maximumStamina"], Decimal(0)).toNumber()}
                />
            </Grid>
        </Paper>
        <Paper style={styles.action}>
            <strong>{props.currentAction.description}</strong>
            <progress style={styles.actionProgress} value={props.actionTime}
                      max={maxActionTime}/>
            {Math.floor(props.actionTime)} / {maxActionTime}
        </Paper>
        <ActionLog actionLog={props.actionLog}/>
    </div>
}

export function actionButton(action, text, description, props) {
    return <Tooltip title={description}>
        <Button {...props} onClick={() => props.setNextAction(action)} style={styles.actions.buttons}
                variant={props.nextActionName === action ? "contained" : "outlined"}
                color={props.nextActionName === action ? "primary" : "default"}>
            {text}
        </Button>
    </Tooltip>
}