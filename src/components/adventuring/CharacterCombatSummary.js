import Grid from "@material-ui/core/Grid";
import React from "react";
import {Statuses} from "../../data/Statuses";
import Tooltip from "@material-ui/core/Tooltip";
import {Decimal} from "decimal.js";

export default function CharacterCombatSummary(props) {
    return <Grid item container xs>
        <Grid item xs={12} container direction={props.direction}>
            <Grid item xs={6}>
                <div style={{
                    display: "flex",
                    alignItems: "center"
                }}>
                    {props.isRival && <img src="./icons/icons-793.png"/>}
                    {props.name}
                </div>
            </Grid>
            <Grid item xs={6}>
                <meter style={{width: "80%"}} low={33} high={66} optimum={100} min={0} max={100}
                       value={props.currentHp.div(props.maximumHp).times(100).floor().toNumber()}
                       max={100}></meter>
            </Grid>
        </Grid>
        <Grid item xs={12} container direction="row">
            <Grid item xs>
                <Tooltip title={`Remaining Accuracy Points: ${props.precisionPoints}/${props.maxPrecisionPoints}`}>
                    <div style={{alignItems: "center", display: "flex"}}>
                        <img src="./icons/icons-836.png"/>
                        <meter min={0} max={props.maxPrecisionPoints} value={props.precisionPoints} style={{width: "100%"}}/>
                    </div>
                </Tooltip>
            </Grid>
            <Grid item xs>
                <Tooltip title={`Remaining Evasion Points: ${props.evasionPoints}/${props.maxEvasionPoints}`}>
                    <div style={{alignItems: "center", display: "flex"}}>
                        <img src="./icons/icons-65.png"/>
                        <meter min={0} max={props.maxEvasionPoints} value={props.evasionPoints} style={{width: "100%"}}/>
                    </div>
                </Tooltip>
            </Grid>
        </Grid>
        <Grid container item xs={12} style={{height: "40px"}} direction={props.direction}>
            {props.statuses && Object.keys(props.statuses).map(status => {
                const modifiers = Object.keys(Statuses[status].effects).reduce((combined, next) => {
                    switch (next) {
                        case "power_modifier":
                        case "evasion_modifier":
                        case "precision_modifier":
                        case "evasion_modifier":
                        case "accuracy_modifier":
                            combined[next] = Decimal.abs(Decimal(1).minus(Decimal(1).plus(Decimal(Statuses[status].effects[next])).pow(props.statuses[status])).times(100));
                            break;
                    }
                    return combined;
                }, {});
                return <Grid item xs={1}>
                    <Tooltip title={Statuses[status].description(modifiers)}>
                        <img src={Statuses[status].icon}/>
                    </Tooltip>
                </Grid>
            })}
        </Grid>
    </Grid>
}