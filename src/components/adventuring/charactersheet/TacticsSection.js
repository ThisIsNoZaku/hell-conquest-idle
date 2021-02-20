import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import React, {useContext} from "react";
import TacticsDescription from "./TacticsDescription";
import {Tactics} from "../../../data/Tactics";
import {EnemyContext, PlayerContext} from "../../scene/AdventuringPage";

export default function TacticsSection(props) {
    const character = useContext(props.isPc ? PlayerContext : EnemyContext); 
    return <Grid container>
        <Grid item xs={12}>
            <Tooltip title="Approach to other-hurting">
                <span>Utilizing {Tactics.defensive[character.tactics.defensive].title} Tactics</span>
            </Tooltip>
        </Grid>
        <Grid container direction="row">
            <TacticsDescription tactic={Tactics.defensive[character.tactics.defensive]}/>
        </Grid>
        <Grid item xs={12}>
            <Tooltip title="Approach to self-protection">
                <span>Utilizing {Tactics.offensive[character.tactics.offensive].title} Tactics</span>
            </Tooltip>
        </Grid>
        <Grid container direction="row">
            <TacticsDescription tactic={Tactics.offensive[character.tactics.offensive]}/>
        </Grid>

    </Grid>
}