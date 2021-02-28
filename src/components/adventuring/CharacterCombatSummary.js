import Grid from "@material-ui/core/Grid";
import React from "react";
import {Statuses} from "../../data/Statuses";
import Tooltip from "@material-ui/core/Tooltip";
import {Decimal} from "decimal.js";
import {useMediaQuery, useTheme} from "@material-ui/core";

export default function CharacterCombatSummary(props) {
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("lg"));
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
                        {!smallScreen && <meter style={{width: "100%"}} low={33} high={66} optimum={100} min={0} max={100}
                               value={props.hp.div(props.maximumHp).times(100).floor().toNumber()}
                               max={100}></meter> }
                        {smallScreen && <div>{props.hp.toFixed()}/{props.maximumHp.toFixed()}</div>}
                    </div>
                </Tooltip>
            </Grid>
            <Grid item xs={4}>
                <Tooltip title={`Energy ${props.stamina}/${props.maxStamina}`}>
                    <div style={{display: "flex", flexDirection: props.direction, alignItems: "center"}}>
                        <img src="./icons/icons-64.png"/>
                        {!smallScreen && <meter style={{width: "100%"}} min={0} optimum={1} high={props.maxStamina} value={props.stamina} max={props.maxStamina * 1.001}
                        />}
                        {smallScreen && <div>{props.stamina.toFixed()}/{props.maxStamina.toFixed()}</div>}
                    </div>
                </Tooltip>
            </Grid>
        </Grid>
        <Grid container item xs={12} style={{height: "40px"}} direction={props.direction}>
            {props.statuses && props.statuses.map(statusInstance => {
                const numStacks = statusInstance.stacks;
                const statusDef = Statuses[statusInstance.status];
                const modifiers = Object.keys(statusDef.effects).reduce((combined, next) => {
                    if(statusDef.effects[next].value) {
                        const modifier = Decimal(statusDef.effects[next].value).times(numStacks);
                        combined[next] = Decimal.abs(modifier);
                    } else {
                        const value = Decimal(statusDef.effects[next].value || 1).times(numStacks);
                        combined[next] = Decimal.abs(value);
                    }
                    return combined;
                }, {});
                return <Grid item xs={2}>
                    <Tooltip title={<div dangerouslySetInnerHTML={{__html: `<strong>${Statuses[statusInstance.status].name}</strong>: ${Statuses[statusInstance.status].description(modifiers)}`}}/>} >
                        <Grid container direction={props.direction}>
                            <Grid item xs>
                                <img src={Statuses[statusInstance.status].icon}/>
                            </Grid>
                            <Grid item xs style={{textAlign: "center"}}>
                                {Decimal(statusInstance.duration).plus(1).toFixed()}
                            </Grid>

                        </Grid>
                    </Tooltip>
                </Grid>
            })}
        </Grid>
    </Grid>
}