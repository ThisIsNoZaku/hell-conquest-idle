import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import {getCharacter} from "../../engine";
import React from "react";
import {config} from "../../config";
import {Tactics} from "../../data/Tactics";

export default function TacticsSection(props) {
    return <Grid container>
        <Grid item xs={12}>
            <Tooltip title="Select your approach to combat">
                <span>Selected Tactics</span>
            </Tooltip>
        </Grid>
        <Grid container direction="row">
            {Tactics[props.character.tactics].title}
        </Grid>

    </Grid>
}