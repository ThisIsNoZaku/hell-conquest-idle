import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import {Help} from "@material-ui/icons";
import React, {useMemo} from "react";
import {getPowerNeededForLevel, getSpriteForCreature} from "../engine";
import {Traits} from "../data/Traits";
import {config} from "../config";
import {useMediaQuery} from "@material-ui/core";
import PowerLevelDisplay from "./charactersheet/PowerLevelDisplay";
import CharacterAttributes from "./charactersheet/CharacterAttributes";
import CharacterTraits from "./charactersheet/CharacterTraits";

const styles = {
    tooltip: {
        fontSize: "12pt"
    }
}

export default function CharacterSheet(props) {
    const spriteSrc = useMemo(() => getSpriteForCreature(props.character.appearance), [props.character.appearance]);
    const combinedHitWeights = props.character.combat.minimumDamageWeight.plus(props.character.combat.medianDamageWeight)
        .plus(props.character.combat.maximumDamageWeight);
    const powerForCurrentLevel = getPowerNeededForLevel(props.character.powerLevel);
    const powerNeededForNextLevel = getPowerNeededForLevel(props.character.powerLevel.plus(1));
    const powerToNextLevel = powerNeededForNextLevel.minus(powerForCurrentLevel);

    return <Grid container>
        <Grid item xs={12}>
            <img src={spriteSrc} style={{height: "75px"}}/>
        </Grid>
        <Grid item container>
            <PowerLevelDisplay powerLevel={props.character.powerLevel}/>
        </Grid>
        {props.character.absorbedPower !== undefined && <Grid item xs={12}>
            <progress
                value={powerForCurrentLevel.div(powerToNextLevel).mul(100).toNumber()}
                max={100}
                title={`${props.character.absorbedPower.toFixed()}/${getPowerNeededForLevel(props.character.powerLevel.plus(1)).toFixed()}`}
            ></progress>
        </Grid>}
        <Grid container>
            <Grid item container>
                <Grid item xs>
                    <strong>Combat Attributes</strong>
                </Grid>
            </Grid>
            <CharacterAttributes character={props.character}/>
        </Grid>
        <Grid container>
            <Grid item xs={12}>
                <strong>Derived</strong>
            </Grid>
            <Grid container>
                <Grid item xs={4}>
                    Glancing Blow
                </Grid>
                <Grid item xs={4}>
                    {props.character.combat.minimumDamageWeight.div(combinedHitWeights).times(100).toFixed()}%
                </Grid>
                <Grid item xs={4}>
                    {props.character.combat.minimumDamage.toFixed()}
                </Grid>
            </Grid>
            <Grid container>
                <Grid item xs={4}>
                    Solid Hit
                </Grid>
                <Grid item xs={4}>
                    {props.character.combat.medianDamageWeight.div(combinedHitWeights).times(100).toFixed()}%
                </Grid>
                <Grid item xs={4}>
                    {props.character.combat.medianDamage.toFixed()}
                </Grid>
            </Grid>
            <Grid container>
                <Grid item xs={4}>
                    Critical Hit
                </Grid>
                <Grid item xs={4}>
                    {props.character.combat.maximumDamageWeight.div(combinedHitWeights).times(100).toFixed()}%
                </Grid>
                <Grid item xs={4}>
                    {props.character.combat.maximumDamage.toFixed()}
                </Grid>
            </Grid>
        </Grid>
        <Grid container>
            <Grid item xs={12}>
                <strong>Traits</strong>
            </Grid>
            <CharacterTraits character={props.character}/>
        </Grid>
        {config.artifacts.enabled && <Grid container>
            <Grid item xs={12}>
                <strong>Artifacts</strong>
            </Grid>
            <Grid>
                {
                    JSON.stringify(props.character.items)
                }
            </Grid>
        </Grid>}
    </Grid>

}