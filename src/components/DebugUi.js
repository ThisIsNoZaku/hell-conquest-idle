import Paper from "@material-ui/core/Paper";
import React, {useState} from "react";
import { Decimal } from "decimal.js";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import {Creatures} from "../data/creatures";
import Button from "@material-ui/core/Button";
import AddCircleOutlineRoundedIcon from '@material-ui/icons/AddCircleOutlineRounded';
import RemoveCircleOutlineRoundedIcon from '@material-ui/icons/RemoveCircleOutlineRounded';
import {getCharacter, getGlobalState, resetDebug, saveKey} from "../engine";
import * as _ from "lodash";
import {Regions} from "../data/Regions";
import {getConfigurationValue} from "../config";
import Checkbox from "@material-ui/core/Checkbox";

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
    const [playerLevel, setPlayerLevel] = useState(getCharacter(0).powerLevel);
    const [latentPower, setLatentPower] = useState(getCharacter(0).latentPower);
    const [levelUpDisabled, setLevelUpDisabled] = useState(_.get(getGlobalState(), ["debug", "levelUpDisabled"], false));
    const [latentPowerGrowthDisabled, setLatentPowerGrowthDisabled] = useState(_.get(getGlobalState(), ["debug", "latentPowerGrowthDisabled"], false));
    const [forceEnableReincarnate, setForceEnableReincarnate] = useState(_.get(getGlobalState(), ["debug", "forceEnableReincarnate"]));

    function reset() {
        resetDebug();
        setCreatures(_.get(getGlobalState(), ["debug", "creatures"]));
        setRegions(_.get(getGlobalState(), ["debug", "regions"]));
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
            <Grid item xs={12}>
                Character Stats
            </Grid>
            <Grid item container xs={12}>
                <Grid item>
                    Power Level
                </Grid>
                <Grid item>
                    <TextField type="number" value={playerLevel} min={0} onChange={e => {
                        const val = Decimal.max(1, Decimal.min(100, e.target.value));
                        getCharacter(0).powerLevel = val;
                        setPlayerLevel(val.toNumber());
                    }}></TextField>
                </Grid>
                <Grid item>
                    Disable Level Up
                </Grid>
                <Grid item>
                    <Checkbox checked={levelUpDisabled} onChange={e => {
                        _.set(getGlobalState(), ["debug", "levelUpDisabled"], e.target.checked === true);
                        setLevelUpDisabled(e.target.checked === true);
                    }}></Checkbox>
                </Grid>
                <Grid item>
                    Latent Power
                </Grid>
                <Grid item>
                    <TextField type="number" value={latentPower} min={0} onChange={e => {
                        const val = Decimal.max(0, Decimal.min(1000000, e.target.value));
                        getCharacter(0).latentPower = val;
                        setLatentPower(val.toNumber());
                    }}></TextField>
                </Grid>
                <Grid item>
                    Disable Latent Power Growth
                </Grid>
                <Grid item>
                    <Checkbox checked={latentPowerGrowthDisabled} onChange={e => {
                        _.set(getGlobalState(), ["debug", "latentPowerGrowthDisabled"], e.target.checked === true);
                        setLatentPowerGrowthDisabled(e.target.checked === true);
                    }}></Checkbox>
                </Grid>
                <Grid item>
                    <Button variant="contained" disabled={_.get(getGlobalState(), ["rival", "type"], null) !== null} onClick={() => getGlobalState().rival = {}}>Clear Rival</Button>
                </Grid>
                <Grid item>
                    Force Enable Reincarnate
                    <Checkbox checked={forceEnableReincarnate} onChange={e => {
                        _.set(getGlobalState(), ["debug", "forceEnableReincarnate"], e.target.checked === true);
                        setForceEnableReincarnate(e.target.checked === true);
                    }}></Checkbox>
                </Grid>
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
                <h3>Creatures</h3>
            </Grid>
            <Grid container item xs={12}>
                {Object.keys(Creatures).map(id => {
                    const enabled = creatures[id] !== false && _.get(creatures, [id, "enabled"]) !== false;
                    return <Grid item xs={3}>
                        <Button variant="contained" color={enabled ? "default" : "secondary"}
                                style={{width: "100%", height: "100%"}}
                                onClick={() => {
                                    _.set(getGlobalState(), ["debug", "creatures", id, "enabled"], !enabled);
                                    setCreatures({...creatures, [id]: {enabled: !enabled}})
                                }}
                        >
                            <img src={`./monsters/${Creatures[id].texture}`}/>
                            {Creatures[id].name}
                        </Button>
                    </Grid>
                })}
            </Grid>
            <Grid container item xs={12}>
                <Grid item>

                </Grid>
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
            </Grid>
        </Grid>
    </Paper>
}