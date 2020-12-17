import Grid from "@material-ui/core/Grid";
import React, {useRef} from "react";
import {Creatures} from "../../data/creatures";
import Button from "@material-ui/core/Button";
import {getCharacter, getGlobalState, getSpriteForCreature} from "../../engine";
import Tooltip from "@material-ui/core/Tooltip";
import {Traits} from "../../data/Traits";
import * as _ from "lodash";
import { useHistory } from "react-router-dom";

export default function ReincarnationSelectionPage(props) {
    const globalState = useRef(getGlobalState());
    const history = useHistory();
    const player = getCharacter(0);

    return <Grid container>
        <Grid item xs={12} style={{textAlign: "center"}}>
            <strong>Reincarnate</strong>
        </Grid>
        <Grid item xs={12} style={{textAlign: "center"}}>
            Select a soul to reincarnate as.
            <br/>
            You will reincarnate with <strong>{player.powerLevel.minus(1).toFixed()}</strong> additional stored energy, letting you start at level { player.powerLevel.minus(1).plus(globalState.current.startingPower).toFixed()}
            <br/>
            You will also gain the following Traits as a result of your previous reincarnations:
            <ul>
            {_.uniq(Object.keys(globalState.current.startingTraits).concat(Object.keys(player.traits)))
                .map(trait => {
                    const player = getCharacter(0);
                    const combinedLevel = _.get(globalState.current.startingTraits, trait, 0) + _.get(player.traits, trait, 0);
                    return <li>
                        <Tooltip title={<div dangerouslySetInnerHTML={{__html:
                            Traits[trait].description({
                                rank: combinedLevel.toFixed()
                            })
                        }}></div>}>
                            <img src={Traits[trait].icon}/>
                        </Tooltip>
                    </li>
                })}
            </ul>
        </Grid>

        <Grid container item xs={12} alignItems="stretch" justify="flex-start">
            {
                Object.keys(Creatures).map(name => {
                    if(!getGlobalState().unlockedMonsters[name]) {
                        return <Grid item container xs={3} justify="space-around" style={{height: "138px"}}>
                            <Grid item xs={12} style={{textAlign: "center", height: "64%"}}>
                                <Tooltip title={<div>{Creatures[name].description}</div>}>
                                    <Button variant="contained" style={{height: "100%", width: "50%"}} onClick={() => {
                                        props.reincarnate("random");
                                        history.push("/adventuring");
                                    } }>
                                        <Grid container>
                                            <Grid item xs={12}>
                                                ???
                                            </Grid>
                                        </Grid>
                                    </Button>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    } else {
                        return <Grid item container xs={3} justify="space-around">
                            <Grid item xs={12} style={{textAlign: "center"}}>
                                <Tooltip title={<div>{Creatures[name].description}</div>}>
                                    <Button variant="contained" style={{height: "100%", width: "50%"}} onClick={() => {
                                        props.reincarnate(name);
                                        history.push("/adventuring");
                                    }}>
                                        <Grid container>
                                            <Grid item xs={12}>
                                                <img src={getSpriteForCreature(name)}/>
                                            </Grid>
                                            <Grid item xs={12}>
                                                {Creatures[name].name}
                                            </Grid>
                                        </Grid>
                                    </Button>
                                </Tooltip>
                            </Grid>
                            {
                                Creatures[name].traits.map(trait => <Grid item xs={1}>
                                    <Tooltip title={<div dangerouslySetInnerHTML={{
                                        __html: Traits[trait].description({
                                            rank: "(rank)"
                                        })
                                    }}>
                                    </div>}>
                                        <img src={Traits[trait].icon}/>
                                    </Tooltip>
                                </Grid>)
                            }
                        </Grid>
                    }
                })
            }
        </Grid>

    </Grid>
}