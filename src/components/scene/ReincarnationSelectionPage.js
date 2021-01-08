import Grid from "@material-ui/core/Grid";
import React, {useEffect, useRef, useState} from "react";
import {Creatures} from "../../data/creatures";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import {evaluateExpression, getCharacter, getGlobalState, getLevelForPower, getSpriteForCreature} from "../../engine";
import Tooltip from "@material-ui/core/Tooltip";
import {Traits} from "../../data/Traits";
import * as _ from "lodash";
import {useHistory} from "react-router-dom";
import {config} from "../../config";
import "../../App.css";
import {Decimal} from "decimal.js";
import {Tactics} from "../../data/Tactics";
import { Attributes } from "../../data/Attributes";
import TacticsDescription from "../charactersheet/TacticsDescription";

export default function ReincarnationSelectionPage(props) {
    const history = useHistory();
    const player = getCharacter(0);
    const [attributes, setAttributes] = useState(Object.keys(player.attributes)
        .reduce((attributes, next) => {
            const baseAttributeProperty = `base${next.substring(1, 2).toUpperCase()}${next.substring(2)}`;
            attributes[next.substring(1)] = player.attributes[baseAttributeProperty];
            return attributes;
        }, {}));
    const [playerTactics, setPlayerTactics] = useState(getCharacter(0).tactics);
    const [startingTraits, setStartingTraits] = useState(getGlobalState().startingTraits);
    const newLatentPower = getCharacter(0).latentPower.plus(
        evaluateExpression(config.mechanics.reincarnation.latentPowerGainOnReincarnate, {
            player
        }));
    const spendableBonusPoints = Decimal(getGlobalState().highestLevelReached).times(config.mechanics.reincarnation.bonusPointsForHighestLevel);
    const latentPowerCap = evaluateExpression(config.mechanics.reincarnation.latentPowerCap, {
        highestLevelEnemyDefeated: Decimal(getGlobalState().highestLevelEnemyDefeated || 0)
    });
    const availableBonusPoints = spendableBonusPoints
        .minus(Object.values(attributes).reduce((sum, next) => {
            next = Decimal(next).minus(config.mechanics.combat.playerAttributeMinimum);
            const totalAttributeCost = Decimal(next).times(Decimal(next).plus(1)).div(2);
            return Decimal(sum).plus(totalAttributeCost);
        }, 0))
        .minus(
            Object.values(startingTraits).filter(x => x).reduce((previousValue, x, i) => {
                return previousValue.plus(evaluateExpression(config.mechanics.reincarnation.traitPointCost, {
                    traitsOwned: Decimal(i)
                }))
            }, Decimal(0))
        );
    const nextBonusTraitCost = evaluateExpression(config.mechanics.reincarnation.traitPointCost, {
        traitsOwned: Decimal(Object.values(startingTraits).filter(x => x).length)
    });
    const nextAttributeCosts = {
        brutality: evaluateExpression(config.mechanics.reincarnation.attributePointCost, {
            attributeScore: attributes.brutality
        }),
        cunning:  evaluateExpression(config.mechanics.reincarnation.attributePointCost, {
            attributeScore: attributes.cunning
        }),
        deceit:  evaluateExpression(config.mechanics.reincarnation.attributePointCost, {
            attributeScore: attributes.deceit
        }),
        madness:  evaluateExpression(config.mechanics.reincarnation.attributePointCost, {
            attributeScore: attributes.madness
        }),
    }

    useEffect(() => {
        getGlobalState().paused = true;
    }, []);

    return <Grid container>
        <Grid item xs={12} style={{textAlign: "center"}}>
            <strong>Reincarnate</strong>
        </Grid>
        {getGlobalState().reincarnationCount !== 0 && <Grid item xs={12} style={{textAlign: "center"}}>
            Select a soul to reincarnate as.
            <br/>
            You will reincarnate with a bonus of  <strong>+{Decimal.min(newLatentPower, latentPowerCap).times(getGlobalState().highestLevelReached).times(config.mechanics.reincarnation.latentPowerEffectScale).toFixed()}</strong> to every Attribute and absorbed power due to your Latent Power acquired from previous reincarnations.
            <br/>
        </Grid>}

        <Grid container>
            <Grid item xs={12} style={{textAlign: "center"}}>
                <strong>You have {availableBonusPoints.toFixed()} {player.powerLevel.gt(1) ? "points" : "point"} to spend out of a max of {spendableBonusPoints.toFixed()} from reaching level {Decimal(getGlobalState().highestLevelReached).toFixed()} on
                    bonuses </strong>
            </Grid>
            <Grid item xs={12} style={{textAlign: "center"}}>
                <strong>Attributes</strong>
            </Grid>
            {Object.keys(Attributes).map(attribute => {
                return <Grid item xs={3}>
                    <Tooltip title={Attributes[attribute].description({
                        rank: Decimal(attributes[attribute]).toFixed()
                    })}>
                        <div style={{textAlign: "center"}}>
                            <img src={Attributes[attribute].icon}/>
                            <div>
                                <Button disabled={availableBonusPoints.lt(nextAttributeCosts[attribute])}
                                        onClick={() => {
                                            setAttributes({
                                                ...attributes,
                                                [attribute]: Decimal(attributes[attribute]).plus(1)
                                            })
                                        }}>
                                    <AddIcon/>
                                </Button>
                                {Decimal(attributes[attribute]).toFixed()}
                                <Button disabled={Decimal(attributes[attribute]).lte(config.mechanics.combat.playerAttributeMinimum)} onClick={() => {
                                    setAttributes({...attributes, [attribute]: Decimal(attributes[attribute]).minus(1)})
                                }}>
                                    <RemoveIcon/>
                                </Button>
                            </div>
                        </div>
                    </Tooltip>
                </Grid>
            })}
            {Object.keys(getGlobalState().unlockedTraits).length > 0 &&
            <Grid item xs={12} style={{textAlign: "center"}}>
                <strong>Bonus Starting Traits</strong> (Start with traits in addition to that innate to your new demon form. Increase the Tier of your traits by reaching highest levels with the demons that possess them.)
            </Grid>}
            {Object.keys(getGlobalState().unlockedTraits).map(traitId => {
                return <Grid item container xs={3} justify="space-around" style={{height: "138px"}}>
                    <Grid item xs={12} style={{textAlign: "center", height: "64%"}}>
                        <Button variant="contained"
                                color={getGlobalState().startingTraits[traitId] ? "secondary" : "default"}
                                disabled={availableBonusPoints.lt(nextBonusTraitCost) && !startingTraits[traitId]}
                                onClick={() => {
                                    getGlobalState().startingTraits[traitId] = !getGlobalState().startingTraits[traitId];
                                    setStartingTraits({...getGlobalState().startingTraits});
                                }}
                        >
                            <Tooltip title={<div dangerouslySetInnerHTML={{
                                __html: `Rank ${Decimal(getGlobalState().unlockedTraits[traitId]).toFixed()}: ${Traits[traitId].description({
                                    rank: Decimal(getGlobalState().unlockedTraits[traitId])
                                })}`
                            }}>
                            </div>}>
                                <Grid container>
                                    <Grid item xs={12}>
                                        <img src={Traits[traitId].icon}/>
                                    </Grid>
                                    <Grid item xs={12}>
                                        {Traits[traitId].name} {Decimal(getGlobalState().unlockedTraits[traitId]).toFixed()}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <em style={{visibility: startingTraits[traitId] ? "hidden" : "visible" }}>{nextBonusTraitCost.toFixed()} pts</em>
                                    </Grid>
                                </Grid>
                            </Tooltip>
                        </Button>
                    </Grid>
                </Grid>
            })}
        </Grid>
        <Grid container item>
            <Grid item xs={12} style={{textAlign: "center"}}>
                <Tooltip title="Tactics provide modifiers based on your fighting style">
                    <strong>Choose Tactics</strong>
                </Tooltip>
            </Grid>
            <Grid container item xs={12} justify="space-around" direction="row">
                {Object.keys(Tactics).map(tactic =>
                    <Grid item>
                        <Button variant="contained" onClick={() => {
                            setPlayerTactics(getCharacter(0).tactics = tactic)
                        }}
                                color={player.tactics === tactic ? "primary" : "default"}
                        >{Tactics[tactic].title}</Button>
                    </Grid>
                )}
            </Grid>
            <Grid item style={{textAlign: "center"}}>
                <em>{Tactics[player.tactics].description}</em>
            </Grid>

            <TacticsDescription tactic={player.tactics}/>

        </Grid>

        <Grid container item xs={12} alignItems="stretch" justify="flex-start">
            <Grid item xs={12} style={{textAlign: "center"}}>
                <strong>Choose a demon to reincarnate as.</strong>
            </Grid>
            {
                Object.keys(Creatures)
                    .filter(id => {
                            const creatureEnabled = Creatures[id].enabled !== false;
                            const debugEnabled = _.get(getGlobalState(), ["debug", "creatures", id, "enabled"], true);
                            return creatureEnabled && debugEnabled;
                        }
                    )
                    .map(name => {
                        if (!getGlobalState().unlockedMonsters[name]) {
                            return <Grid container xs={3} justify="space-around" style={{height: "150px"}}>
                                <Grid item xs={12} style={{textAlign: "center", height: "64%"}}>
                                    <Tooltip
                                        title={<div>An unknown type of Demon. Selects a random Demon you have not
                                            already
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
                            return <Grid container xs={3} justify="space-around">
                                <Grid item xs={12} style={{textAlign: "center", height: "150px"}}>
                                    <Tooltip title={<div>{Creatures[name].description}</div>}>
                                        <Button variant="contained" style={{height: "75%", width: "50%"}}
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
                            </Grid>
                        }
                    })
            }
        </Grid>
    </Grid>
}