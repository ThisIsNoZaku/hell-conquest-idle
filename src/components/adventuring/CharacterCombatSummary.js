import Grid from "@material-ui/core/Grid";
import React from "react";
import {Statuses} from "../../data/Statuses";
import Tooltip from "@material-ui/core/Tooltip";
import {Decimal} from "decimal.js";

export default function CharacterCombatSummary(props) {
    return <Grid item container xs>
        <Grid item xs={12} container direction={props.direction}>
            <Grid item xs={4}>
                <div>
                    {props.isRival && <Tooltip title="Your Rival!"><img src="./icons/icons-793.png"/></Tooltip>}
                    {props.name}
                </div>
            </Grid>
            <Grid item xs={4}>
                <Tooltip title={`Health ${props.hp}/${props.maximumHp}`}>
                    <div style={{display: "flex", flexDirection: props.direction, alignItems: "center"}}>
                        <img src="./icons/icons-464.png"/>
                        <meter style={{width: "100%"}} low={33} high={66} optimum={100} min={0} max={100}
                               value={props.hp.div(props.maximumHp).times(100).floor().toNumber()}
                               max={100}></meter>
                    </div>
                </Tooltip>
            </Grid>
            <Grid item xs={4}>
                <Tooltip title={`Energy ${props.stamina}/${props.maxStamina}`}>
                    <div style={{display: "flex", flexDirection: props.direction, alignItems: "center"}}>
                        <img src="./icons/icons-64.png"/>
                        <meter style={{width: "100%"}} min={0} max={props.maxStamina}
                               value={props.stamina}>
                        </meter>
                    </div>
                </Tooltip>
            </Grid>
        </Grid>
        <Grid container item xs={12} style={{height: "40px"}} direction={props.direction}>
            {props.statuses && Object.keys(props.statuses).map(status => {
                const numStacks = props.statuses[status].reduce((highest, next) => {
                    return Decimal.max(highest, next.stacks);
                }, 0);
                const modifiers = Object.keys(Statuses[status].effects).reduce((combined, next) => {
                    if(Statuses[status].effects[next].modifier) {
                        const modifier = Decimal(Statuses[status].effects[next].modifier).times(numStacks);
                        combined[next] = Decimal.abs(modifier);
                    } else {
                        const value = Decimal(Statuses[status].effects[next].value).times(numStacks);
                        combined[next] = Decimal.abs(value);
                    }
                    return combined;
                }, {});
                return <Grid item xs={1}>
                    <Tooltip title={<div dangerouslySetInnerHTML={{__html: `<strong>${Statuses[status].name}</strong>: ${Statuses[status].description(modifiers)}`}}/>} >
                        <img src={Statuses[status].icon}/>
                    </Tooltip>
                </Grid>
            })}
        </Grid>
    </Grid>
}