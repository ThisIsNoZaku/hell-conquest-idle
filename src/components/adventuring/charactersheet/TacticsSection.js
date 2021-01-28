import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import React from "react";
import TacticsDescription from "./TacticsDescription";
import {Tactics} from "../../../data/Tactics";

export default function TacticsSection(props) {
    return <Grid container>
        <Grid item xs={12}>
            <Tooltip title="Approach to other-hurting">
                <span>Utilizing {Tactics.defensive[props.characterTactics.defensive].title} Tactics</span>
            </Tooltip>
        </Grid>
        <Grid container direction="row">
            <TacticsDescription tactic={Tactics.defensive[props.characterTactics.defensive]}/>
        </Grid>
        <Grid item xs={12}>
            <Tooltip title="Approach to self-protection">
                <span>Utilizing {Tactics.offensive[props.characterTactics.offensive].title} Tactics</span>
            </Tooltip>
        </Grid>
        <Grid container direction="row">
            <TacticsDescription tactic={Tactics.offensive[props.characterTactics.offensive]}/>
        </Grid>

    </Grid>
}