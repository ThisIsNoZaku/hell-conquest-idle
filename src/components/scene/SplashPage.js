import Paper from "@material-ui/core/Paper";
import React, {useEffect} from "react";
import Button from "@material-ui/core/Button";
import { useHistory } from "react-router-dom";
import { Grid } from "@material-ui/core";
import {getGlobalState} from "../../engine";
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
                Conquest of Hell Ver. {pkg.version}
            </Grid>
            <Grid item container>
                {Object.keys(changelog).map(version => {
                    return <Grid item container xs={12}>
                        <Grid item xs={12}>
                            {version}
                        </Grid>
                        <ul>
                        {changelog[version].map(entry => {
                            return <li key={entry}>
                                {entry}
                            </li>
                        })}
                        </ul>
                    </Grid>
                })}
            </Grid>
            <Grid item xs={12} style={{textAlign: "center"}}>
                <Button onClick={() => {
                    if(getGlobalState().currentAction === null) {
                        history.push("/reincarnating")
                    } else {
                        history.push("/adventuring")
                    }
                }}>
                    Start
                </Button>
            </Grid>
        </Grid>
    </Paper>
}