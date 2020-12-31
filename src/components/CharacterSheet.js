import Grid from "@material-ui/core/Grid";
import React, {useMemo} from "react";
import {getPowerNeededForLevel, getSpriteForCreature} from "../engine";
import {config} from "../config";
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
    const hitChances = props.character.combat.getHitChancesAgainst(props.enemy);
    const combinedHitWeights = Object.values(hitChances).reduce((total, next) => total.plus(next));
    const powerRequiredForCurrentLevel = getPowerNeededForLevel(props.character.powerLevel);
    const powerNeededForNextLevel = getPowerNeededForLevel(props.character.powerLevel.plus(1));
    const progressToNextLevel = props.character.absorbedPower.minus(powerRequiredForCurrentLevel);

    return <Grid container>
        <Grid item xs={12}>
            <img src={spriteSrc} style={{height: "75px"}}/>
        </Grid>
        <Grid item container>
            <PowerLevelDisplay powerLevel={props.character.powerLevel}/>
        </Grid>
        {props.character.absorbedPower !== undefined && <Grid item xs={12}>
            <progress
                value={progressToNextLevel.div(powerNeededForNextLevel).times(100).toNumber()}
                max={100}
                title={`${progressToNextLevel.toFixed()}/${powerNeededForNextLevel.toFixed()}`}
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
                    {hitChances.minimum.div(combinedHitWeights).times(100).round().toFixed()}%
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
                    {hitChances.median.div(combinedHitWeights).times(100).round().toFixed()}%
                </Grid>
                <Grid item xs={4}>
                    {props.character.combat.medianDamage.toFixed()}
                </Grid>
            </Grid>
            <Grid container>
                <Grid item xs={4}>
                    Serious Hit
                </Grid>
                <Grid item xs={4}>
                    {hitChances.max.div(combinedHitWeights).times(100).round().toFixed()}%
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