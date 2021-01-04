import Paper from "@material-ui/core/Paper";
import React, {useMemo} from "react";
import Button from "@material-ui/core/Button";
import {useHistory} from "react-router-dom";
import {getCharacter, getGlobalState, getLevelForPower, getPowerNeededForLevel} from "../engine";
import Alert from '@material-ui/lab/Alert';
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
    const reincarnateEnabled = useMemo(() => getCharacter(0).powerLevel.gt(1) || !getCharacter(0).isAlive, [
        getCharacter(0).powerLevel,
        getCharacter(0).isAlive
    ])
    return <div style={styles.root}>
        <Grid container direction="column">
            <Grid item xs>
                {reincarnateEnabled &&
                <Button onClick={() => history.push("/reincarnating")} style={styles.buttons} variant="contained"
                        color="secondary" disabled={!reincarnateEnabled}>
                    Reincarnate
                </Button>}
            </Grid>
            <Grid item xs>
                {props.automaticReincarnateEnabled &&
                <Paper style={{width: "100%", backgroundColor: "orange"}}>Automatic Reincarnation Enabled (Strongest enemy defeated: Level {Decimal(getGlobalState().highestLevelEnemyDefeated).toFixed()})</Paper>}
            </Grid>
        </Grid>
    </div>
}