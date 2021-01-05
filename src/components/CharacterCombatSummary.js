import Grid from "@material-ui/core/Grid";
import React from "react";
import {Statuses} from "../data/Statuses";

export default function CharacterCombatSummary(props) {
    return <Grid item container xs >
        <Grid item xs={12} container direction={props.direction}>
            <Grid item xs={6}>
                <div style={{
                    display: "flex",
                    alignItems: "center"
                }}>
                    {props.isRival && <img src="./icons/icons-793.png"/> }
                    {props.name}
                </div>
            </Grid>
            <Grid item xs={6}>
                <meter style={{width: "80%"}} low={33} high={66} optimum={100} min={0} max={100}
                       value={props.currentHp.div(props.maximumHp).times(100).floor().toNumber()}
                       max={100}></meter>
            </Grid>
        </Grid>
        <Grid container item xs={12} style={{height: "40px"}} direction={props.direction}>
            {props.statuses && Object.keys(props.statuses).map(status => {
                return <Grid item xs={1}>
                    <img src={Statuses[status].icon}/>
                </Grid>
            })}
        </Grid>
    </Grid>
}