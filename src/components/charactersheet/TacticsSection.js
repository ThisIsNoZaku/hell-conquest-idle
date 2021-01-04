import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import React from "react";
import TacticsDescription from "./TacticsDescription";
import {Tactics} from "../../data/Tactics";

export default function TacticsSection(props) {
    return <Grid container>
        <Grid item xs={12}>
            <Tooltip title="Your approach to combat">
                <span>Utilizing {Tactics[props.characterTactics].title} Tactics</span>
            </Tooltip>
        </Grid>
        <Grid container direction="row">
            <TacticsDescription tactic={props.characterTactics}/>
        </Grid>

    </Grid>
}