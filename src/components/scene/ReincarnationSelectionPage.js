import Grid from "@material-ui/core/Grid";
import React, {useEffect, useRef, useState} from "react";
import {Creatures} from "../../data/creatures";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import {getCharacter, getGlobalState, getLevelForPower, getSpriteForCreature} from "../../engine";
import Tooltip from "@material-ui/core/Tooltip";
import {Traits} from "../../data/Traits";
import * as _ from "lodash";
import {useHistory} from "react-router-dom";
import {Big} from "big.js";
import {config} from "../../config";
import "../../App.css";

export default function ReincarnationSelectionPage(props) {
    const globalState = useRef(getGlobalState());
    const history = useHistory();
    const player = getCharacter(0);
    const currentCreature = Creatures[player.appearance] || {};
    const [attributes, setAttributes] = useState(Object.keys(player.attributes)
        .reduce((attributes, next) => {
            attributes[next.substring(1)] = player.attributes[next];
            return attributes;
        }, {}));
    const spendableBonusPoints = player.powerLevel.times(config.characters.player.attributesPerLevel);

    useEffect(() => {
        getGlobalState().paused = true;
    }, []);

    return <Grid container>
        <Grid item xs={12} style={{textAlign: "center"}}>
            <strong>Reincarnate</strong>
        </Grid>
        <Grid item xs={12} style={{textAlign: "center"}}>
            Select a soul to reincarnate as.
            <br/>
            You will reincarnate with <strong>{player.powerLevel.minus(1).toFixed()}</strong> additional starting
            energy, letting you start at
            level {getLevelForPower(globalState.current.startingPower.plus(player.powerLevel)).toFixed()}
            <br/>
            You will also gain the following Traits as a result of your previous reincarnations:
            <Grid container>
                {_.uniq(Object.keys(globalState.current.startingTraits).concat(currentCreature.traits || []))
                    .map(trait => {
                        const player = getCharacter(0);
                        const currentStartingRank = _.get(globalState.current.startingTraits, trait, Big(0));
                        const combinedLevel = player.powerLevel.gt(currentStartingRank) ? player.powerLevel : currentStartingRank;
                        return <Grid item xs={1}>
                            <Tooltip title={<div dangerouslySetInnerHTML={{
                                __html:
                                    Traits[trait].description({
                                        rank: combinedLevel.toFixed()
                                    })
                            }}></div>}>
                                <img src={Traits[trait].icon}/>
                            </Tooltip>
                        </Grid>
                    })}
            </Grid>
        </Grid>

        <Grid container>
            <Grid item xs={12} style={{textAlign: "center"}}>
                <strong>Spend {spendableBonusPoints.toFixed()} {player.powerLevel.gt(1) ? "points" : "point"} on bonuses:</strong>
            </Grid>
            <Grid item xs={12} style={{textAlign: "center"}}>
                <strong>Attributes</strong>
            </Grid>
            {Object.keys(config.attributes).map(attribute => {
                return <Grid item xs={3}>
                    <Tooltip title={config.attributes[attribute].description({
                        rank: attributes[attribute].toFixed()
                    })}>
                        <div style={{textAlign: "center"}}>
                            <img src={config.attributes[attribute].icon}/>
                            <div>
                                <Button disabled={spendableBonusPoints.eq(_.sum(Object.values(attributes).map(x => x.toNumber())))}
                                        onClick={() => {
                                            setAttributes({...attributes, [attribute]: attributes[attribute].plus(1)})
                                        }}>
                                    <AddIcon/>
                                </Button>
                                {attributes[attribute].toFixed()}
                                <Button disabled={attributes[attribute].toNumber() <= 0} onClick={() => {
                                    setAttributes({...attributes, [attribute]: attributes[attribute].minus(1)})
                                }}>
                                    <RemoveIcon/>
                                </Button>
                            </div>
                        </div>
                    </Tooltip>
                </Grid>
            })}
        </Grid>

        <Grid container item xs={12} alignItems="stretch" justify="flex-start">
            <Grid item xs={12} style={{textAlign: "center"}}>
                <strong>Choose a demon to reincarnate as.</strong>
            </Grid>
            {
                Object.keys(Creatures)
                    .filter(id => _.get(getGlobalState(), ["creatures", id, "enabled"], true) &&
                    _.get(getGlobalState(), ["debug", "creatures", id, "enabled"], true))
                    .map(name => {
                    if (!getGlobalState().unlockedMonsters[name]) {
                        return <Grid item container xs={3} justify="space-around" style={{height: "138px"}}>
                            <Grid item xs={12} style={{textAlign: "center", height: "64%"}}>
                                <Tooltip
                                    title={<div>An unknown type of Demon. Selects a random Demon you have not already
                                        played as.</div>}>
                                    <Button variant="contained" style={{height: "100%", width: "50%"}}
                                            onClick={() => {
                                                props.reincarnate("random", attributes);
                                                history.push("/adventuring");
                                            }}>
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
                                    <Button variant="contained" style={{height: "100%", width: "50%"}}
                                            onClick={() => {
                                                props.reincarnate(name, attributes);
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