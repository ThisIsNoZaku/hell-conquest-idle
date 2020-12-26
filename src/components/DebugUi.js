import Paper from "@material-ui/core/Paper";
import React, {useState} from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import {Creatures} from "../data/creatures";
import Button from "@material-ui/core/Button";
import AddCircleOutlineRoundedIcon from '@material-ui/icons/AddCircleOutlineRounded';
import RemoveCircleOutlineRoundedIcon from '@material-ui/icons/RemoveCircleOutlineRounded';
import {getCharacter, getGlobalState, resetDebug, saveKey} from "../engine";
import * as _ from "lodash";
import {Regions} from "../data/Regions";
import {config} from "../config";
import {Big} from "big.js";

const styles = {
    root: {
        position: "absolute",
        minHeight: "100vh",
        bottom: 0,
        left: 0,
        padding: "20px"
    }
}

export default function DebugUi(props) {
    const [creatures, setCreatures] = useState(_.get(getGlobalState(), ["debug", "creatures"]));
    const [regions, setRegions] = useState(_.get(getGlobalState(), ["debug", "regions"]));
    const [minLevel, setMinLevel] = useState(_.get(getGlobalState(), ["debug", "encounters", "minLevel"], getCharacter(0).powerLevel.minus(config.encounters.lesserLevelScale).lt(Big(1)) ?
        Big(1) : getCharacter(0).powerLevel.minus(config.encounters.lesserLevelScale)));
    const [maxLevel, setMaxLevel] = useState(_.get(getGlobalState(), ["debug", "encounters", "maxLevel"], getCharacter(0).powerLevel.plus(config.encounters.greaterLevelScale).gt(100) ?
        Big(100) : getCharacter(0).powerLevel.plus(config.encounters.greaterLevelScale * 2)));
    const [manualSpeedMultiplier, setManualSpeedMultiplier] = useState(_.get(getGlobalState(), ["debug", "manualSpeedMultiplier"],
        getGlobalState().manualSpeedMultiplier));
    const [playerAbsorbedPower, setPlayerAbsorbedPower] = useState(getCharacter(0).absorbedPower);

    function reset() {
        resetDebug();
        setCreatures(_.get(getGlobalState(), ["debug", "creatures"]));
        setRegions(_.get(getGlobalState(), ["debug", "regions"]));
        setMinLevel(getCharacter(0).powerLevel.minus(config.encounters.lesserLevelScale).lt(Big(1)) ?
            Big(1) : getCharacter(0).powerLevel.minus(config.encounters.lesserLevelScale));
        setMaxLevel(getCharacter(0).powerLevel.plus(config.encounters.greaterLevelScale).gt(100) ?
            Big(100) : getCharacter(0).powerLevel.plus(config.encounters.greaterLevelScale * 2));
    }

    function clearSave() {
        window.localStorage.removeItem(saveKey);
        alert("local storage cleared");
    }

    return <Paper style={styles.root} disabled={true}>
        <Grid container>
            <Grid item xs={12} style={{textAlign: "center"}}>
                <h3>Debug Menu</h3>
            </Grid>
            <Grid item container xs={12}>
                <Grid item xs={6} style={{textAlign: "center"}}>
                    <Button variant="contained" color="secondary" onClick={reset}>
                        Reset Debug Settings
                    </Button>
                </Grid>
                <Grid item xs={6} style={{textAlign: "center"}}>
                    <Button variant="contained" color="secondary" onClick={clearSave}>
                        Clear Save
                    </Button>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Grid item xs={3}>
                    <TextField type="number" value={manualSpeedMultiplier} onChange={e => {
                        const newValue = Number.parseInt(e.target.value);
                        _.set(getGlobalState(), ["debug", "manualSpeedMultiplier"], newValue);
                        setManualSpeedMultiplier(newValue);
                    }} label="Manual speed multiplier"/>
                </Grid>
                <Grid item xs={3}>
                    <TextField type="number" min="0" value={playerAbsorbedPower} onChange={e => {
                        e.target.value = e.target.value === "" ? 0 : e.target.value;
                        const newValue = Big(Number.parseInt(e.target.value));
                        if(newValue.lt(0)) {
                            getCharacter(0).absorbedPower = Big(0);
                            setPlayerAbsorbedPower(Big(0));
                        } else {
                            getCharacter(0).absorbedPower = newValue;
                            setPlayerAbsorbedPower(newValue);
                        }

                    }} label="Current player absorbed power"/>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <h3>Creatures</h3>
            </Grid>
            <Grid container item xs={12}>
                {Object.keys(Creatures).map(id => {
                    const enabled = creatures[id] !== false && _.get(creatures, [id, "enabled"]) !== false;
                    return <Grid item xs={3} style={{height: "100%"}}>
                        <Button variant="contained" color={enabled ? "default" : "secondary"}
                                style={{width: "100%", height: "100%"}}
                                onClick={() => {
                                    _.set(getGlobalState(), ["debug", "creatures", id, "enabled"], !enabled);
                                    setCreatures({...creatures, [id]: {enabled: !enabled}})
                                }}
                        >
                            <img src={`/monsters/${Creatures[id].texture}`}/>
                            {Creatures[id].name}
                        </Button>
                    </Grid>
                })}
            </Grid>
            <Grid item style={{textAlign: "center"}}>
                <h4>Regions</h4>
            </Grid>
            <Grid container item xs={12}>
                {Object.keys(Regions).map(regionId => {
                    return <Grid item xs={6} style={{textAlign: "center"}}>
                        <h4>{Regions[regionId].name}</h4>
                        <Grid item container xs={12}>
                            {Object.keys(Regions[regionId].encounters).map(encounterId => {
                                const enabled = _.get(regions, [regionId, "encounters", encounterId, "enabled"]) !== false;
                                return <Grid item xs={3}>
                                    <Button variant="contained" color={enabled ? "default" : "secondary"}
                                            style={{width: "100%", height: "100%"}}
                                            onClick={() => {
                                                _.set(getGlobalState(), ["debug", "regions", regionId, "encounters", encounterId, "enabled"], !enabled);
                                                setRegions({
                                                    ...regions, [regionId]: _.set(regions[regionId],
                                                        ["encounters", encounterId, "enabled"],
                                                        !enabled
                                                    )
                                                })
                                            }}
                                    >
                                        {Regions[regionId].encounters[encounterId].description}
                                    </Button>
                                </Grid>;
                            })}

                        </Grid>
                    </Grid>
                })}
            </Grid>
            <Grid container>
                <Grid item xs={12} style={{textAlign: "center"}}>
                    <h4>Encounter rules</h4>
                </Grid>
                <Grid container item xs={3}>
                    <Grid item>
                        <Button onClick={() => {
                            setMinLevel(minLevel.plus(1));
                            _.set(getGlobalState(), ["debug", "encounters", "minLevel"], minLevel.plus(1));
                            if (minLevel.plus(1).gt(maxLevel)) {
                                setMaxLevel(minLevel.plus(1));
                                _.set(getGlobalState(), ["debug", "encounters", "maxLevel"], minLevel.plus(1));
                            }
                        }}>
                            <AddCircleOutlineRoundedIcon/>
                        </Button>
                    </Grid>
                    <Grid item>
                        Minimum level {minLevel.toFixed()}
                    </Grid>
                    <Grid item>
                        <Button onClick={() => {
                            _.set(getGlobalState(), ["debug", "encounters", "minLevel"], minLevel.minus(1));
                            setMinLevel(minLevel.minus(1));
                        }}>
                            <RemoveCircleOutlineRoundedIcon/>
                        </Button>
                    </Grid>
                </Grid>
                <Grid container item xs={3}>
                    <Grid item>
                        <Button onClick={() => {
                            setMaxLevel(maxLevel.plus(1));
                            _.set(getGlobalState(), ["debug", "encounters", "maxLevel"], maxLevel.plus(1));
                        }}>
                            <AddCircleOutlineRoundedIcon/>
                        </Button>
                    </Grid>
                    <Grid item>
                        Maximum level {maxLevel.toFixed()}
                    </Grid>
                    <Grid item>
                        <Button onClick={() => {
                            _.set(getGlobalState(), ["debug", "encounters", "maxLevel"], maxLevel.minus(1));
                            setMaxLevel(maxLevel.minus(1));
                            if (maxLevel.minus(1).lt(minLevel)) {
                                setMinLevel(maxLevel.minus(1));
                                _.set(getGlobalState(), ["debug", "encounters", "minLevel"], maxLevel.minus(1));
                            }
                        }}>
                            <RemoveCircleOutlineRoundedIcon/>
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    </Paper>
}