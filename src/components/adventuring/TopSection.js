import Paper from "@material-ui/core/Paper";
import React, {useMemo} from "react";
import Button from "@material-ui/core/Button";
import {useHistory} from "react-router-dom";
import {getCharacter, getGlobalState, getLevelForPower, getPowerNeededForLevel} from "../../engine";
import Grid from "@material-ui/core/Grid";
import {Decimal} from "decimal.js";

const styles = {
    root: {
        height: "100%",
        display: "flex",
        flex: "0"
    },
    buttons: {
        width: "100%"
    }
}

export default function TopSection(props) {
    const history = useHistory();
    return <div style={styles.root}>
        <Grid container direction="column">
            <Grid item xs>
                {props.reincarnateEnabled &&
                <Button onClick={() => history.push("/reincarnating")} style={styles.buttons} variant="contained"
                        color="secondary" disabled={!props.reincarnateEnabled}>
                    Reincarnate
                </Button>}
            </Grid>
            <Grid item xs>
                {props.automaticReincarnateEnabled &&
                <Paper style={{width: "100%", backgroundColor: "orange"}}>Automatic Reincarnation Enabled (Strongest enemy defeated: Level {Decimal(props.highestLevelEnemyDefeated).toFixed()})</Paper>}
            </Grid>
        </Grid>
    </div>
}