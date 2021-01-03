import Paper from "@material-ui/core/Paper";
import React, {useEffect} from "react";
import Button from "@material-ui/core/Button";
import {useHistory} from "react-router-dom";
import {Grid} from "@material-ui/core";
import {clearGlobalState, getGlobalState} from "../../engine";
import Tooltip from "@material-ui/core/Tooltip";

const pkg = require("../../../package.json");
const changelog = require("../../changelog.json");

export default function SplashPage(props) {
    useEffect(() => {
        getGlobalState().paused = true;
    })
    const history = useHistory();
    return <Paper>
        <Grid container>
            <Grid item xs={12} style={{textAlign: "center"}}>
                Conquest of Hell Ver. {pkg.version} Save Compatibility NOT Guaranteed
            </Grid>
            <Grid item xs={12} style={{textAlign: "center"}}>
                <Button onClick={() => {
                    if (getGlobalState().currentAction === null) {
                        history.push("/reincarnating")
                    } else {
                        getGlobalState().paused = false;
                        history.push("/adventuring")
                    }
                }} variant="contained" color="primary">
                    Start
                </Button>
            </Grid>
            <Grid item container>
                <Grid item container xs={12}>
                    <Grid item xs={12}>
                        {pkg.version}
                    </Grid>
                    <ul>
                        {changelog[pkg.version].changes.map(entry => {
                            return <li key={entry}>
                                {entry}
                            </li>
                        })}
                    </ul>
                </Grid>
            </Grid>
        </Grid>
        <Grid item xs style={{textAlign: "center"}}>
            <Tooltip title="Delete your previous data and start the game">
                <Button onClick={() => {
                    // eslint-disable-next-line no-restricted-globals
                    const confirmed = confirm("This will wipe all your previous progress.");
                    if(confirmed) {
                        clearGlobalState();
                        if (getGlobalState().currentAction === null) {
                            history.push("/reincarnating")
                        } else {
                            getGlobalState().paused = false;
                            history.push("/adventuring")
                        }
                    }
                }} variant="contained" color="secondary">
                    Hard Reset and Start
                </Button>
            </Tooltip>
        </Grid>
    </Paper>
}