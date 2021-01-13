import {config} from "../../../config";
import Paper from "@material-ui/core/Paper";
import React from "react";
import {actionButton} from "../BottomSection";
import {Decimal} from "decimal.js";
import evaluateExpression from "../../../engine/general/evaluateExpression";
import * as _ from "lodash";

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
    }
}

export default function ApproachingActionsSection(props) {
    const escapeChance = props.enemy ? evaluateExpression(config.encounters.chanceToEscapeGreater, {
        player: props.player,
        enemy: props.enemy
    }) : Decimal(100);
    const intimidateChance = props.enemy ? evaluateExpression(config.encounters.chanceToIntimidateLesser, {
        player: props.player,
        enemy: props.enemy
    }) : Decimal(100);
    return <Paper style={styles.actions.container}>
        {actionButton("fighting", "Fight", "Combat the enemy. On victory, steal some of the power of the vanquished foe.", props)}
        {actionButton("fleeing", "Flee", `Attempt to escape. Your chance is  ${escapeChance}%.`, props)}
        {actionButton("intimidating", "Intimidate", `Try to cow the enemy, compelling them to continuously provide you a portion of their life force. Your chance is ${intimidateChance}%`, props)}
        {_.get(config, "features.negotiating.enabled") && actionButton("negotiating", "Negotiate", "Combat the enemy. On victory, steal some of the power of the vanquished foe.", props)}
    </Paper>
}