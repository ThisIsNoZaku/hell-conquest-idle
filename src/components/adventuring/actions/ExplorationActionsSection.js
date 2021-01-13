import Paper from "@material-ui/core/Paper";
import React from "react";
import {actionButton} from "../BottomSection";
import evaluateExpression from "../../../engine/general/evaluateExpression";
import { config } from "../../../config";
import {Decimal} from "decimal.js";

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
export default function ExplorationActionsSection(props) {
    const canHunt = evaluateExpression(config.encounters.huntableLevel, {
        playerLevel: Decimal(props.player.powerLevel),
    }).gt(0);
    return <Paper style={styles.actions.container}>
        {actionButton("hunting", "Hunt Lesser Demons", "Hunt lesser demons you can Bind to claim their power, increasing your Tithed Power.",
            {...props, disabled: !canHunt})}
        {actionButton("challenging", "Challenge Peer Demons", "Find a demon of equal strength to challenge in battle.", props)}
        {actionButton("usurp", "Usurp Greater Demon", "Find Challenge a Greater Demon to take.", props)}
    </Paper>
}