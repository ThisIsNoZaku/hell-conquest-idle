import Grid from "@material-ui/core/Grid";
import React, {useMemo} from "react";
import {getCharacter, getGlobalState, getPowerNeededForLevel, getSpriteForCreature} from "../engine";
import {config} from "../config";
import PowerLevelDisplay from "./charactersheet/PowerLevelDisplay";
import CharacterAttributes from "./charactersheet/CharacterAttributes";
import CharacterTraits from "./charactersheet/CharacterTraits";
import Tooltip from "@material-ui/core/Tooltip";
import TacticsSection from "./charactersheet/TacticsSection";
import getHitChanceBy from "../engine/combat/getHitChanceBy";
import calculateDamageBy from "../engine/combat/calculateDamageBy";
import * as _ from "lodash";
import {Help} from "@material-ui/icons";
import {Decimal} from "decimal.js";

const styles = {
    tooltip: {
        fontSize: "12pt"
    }
}

export default function CharacterSheet(props) {
    const spriteSrc = useMemo(() => getSpriteForCreature(props.character.appearance), [props.character.appearance]);
    const hitChances = getHitChanceBy(props.character).against(props.enemy)
    const calculatedDamage = useMemo(() => calculateDamageBy(props.character).against(props.enemy),
        [
            props.character,
            props.enemy
        ]);
    const combinedHitWeights = Object.values(hitChances).reduce((total, next) => total.plus(next));
    const powerRequiredForCurrentLevel = getPowerNeededForLevel(props.character.powerLevel);
    const powerNeededForNextLevel = getPowerNeededForLevel(props.character.powerLevel.plus(1));
    const progressToNextLevel = props.character.absorbedPower.minus(powerRequiredForCurrentLevel);


    return <Grid container>
        <Grid item xs={12}>
            <img src={spriteSrc} style={{height: "75px"}}/>
        </Grid>
        <Grid item container>
            <Grid item xs>
                Level
            </Grid>
            <Grid item xs>
                {props.character.powerLevel.toFixed()}
            </Grid>
            <Grid item xs>
                Latent Power Bonus
            </Grid>
            <Grid item xs>
                {props.character.latentPower.times(config.mechanics.reincarnation.latentPowerEffectScale).times(100).toFixed()}%
            </Grid>
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
                    <strong>Attributes</strong>
                </Grid>
            </Grid>
            <CharacterAttributes character={props.character}/>
        </Grid>
        <Grid container>
            <Grid item xs={12}>
                <strong>Combat Statistics</strong>
            </Grid>
            <Grid container>
                <Tooltip title={`Your Power increases the damage your attacks deal by ${Decimal(config.mechanics.combat.power.effectPerPoint).times(props.character.combat.power).times(100).toFixed()}%.`}>
                    <Grid item container>
                        <Grid item xs style={{textAlign: "center"}}>
                            Power
                        </Grid>
                        <Grid item xs>
                            {props.character.combat.power.toFixed()}
                        </Grid>
                    </Grid>
                </Tooltip>
                <Tooltip title={`Your Resilience reduces the damage your attacks deal by ${Decimal(config.mechanics.combat.resilience.effectPerPoint).times(props.character.combat.resilience).times(100).toFixed()}%.`}>
                    <Grid item container>
                        <Grid item xs style={{textAlign: "center"}}>
                            Resilience
                        </Grid>
                        <Grid item xs>
                            {props.character.combat.resilience.toFixed()}
                        </Grid>
                    </Grid>
                </Tooltip>
                <Tooltip title={`Your Evasion reduces the severity of hits you take.`}>
                    <Grid item container>
                        <Grid item xs style={{textAlign: "center"}}>
                            Evasion
                        </Grid>
                        <Grid item xs>
                            {props.character.combat.evasion.toFixed()}
                        </Grid>
                    </Grid>
                </Tooltip>
                <Tooltip title={`Your Precision increases the severity of hits you score.`}>
                    <Grid item container>
                        <Grid item xs style={{textAlign: "center"}}>
                            Precision
                        </Grid>
                        <Grid item xs>
                            {props.character.combat.precision.toFixed()}
                        </Grid>
                    </Grid>
                </Tooltip>
            </Grid>
            <Grid container>
                <Grid item xs={12}>
                    <strong>Hit Chances</strong>
                </Grid>
                <Grid item container xs={12}>
                    <Grid item xs><em>Type</em></Grid>
                    <Grid item xs><em>Chance</em></Grid>
                    <Grid item xs><em>Damage</em></Grid>
                    <Grid item xs={1}></Grid>
                </Grid>
                <Grid item container xs={12}>
                    <Grid item xs>
                        Glancing Hit
                    </Grid>
                    <Grid item xs>
                        {hitChances.min.div(combinedHitWeights).times(100).toFixed(2)}%
                    </Grid>
                    <Grid item xs>
                        {calculatedDamage.min.toFixed()}
                    </Grid>
                    <Grid item xs={1}>
                        <Tooltip title="Glancing hits deal 50% less  damage">
                            <Help/>
                        </Tooltip>
                    </Grid>
                </Grid>

                <Grid item container xs={12}>
                    <Grid item xs>
                        Solid Hit
                    </Grid>
                    <Grid item xs>
                        {hitChances.med.div(combinedHitWeights).times(100).toFixed(2)}%
                    </Grid>
                    <Grid item xs>
                        {calculatedDamage.med.toFixed()}
                    </Grid>
                    <Grid item xs={1}>
                        <Tooltip title="Solid hits deal normal damage">
                            <Help/>
                        </Tooltip>
                    </Grid>
                </Grid>
                <Grid item container xs={12}>
                    <Grid item xs>
                        Critical Hit
                    </Grid>
                    <Grid item xs>
                        {hitChances.max.div(combinedHitWeights).times(100).toFixed(2)}%
                    </Grid>
                    <Grid item xs>
                        {calculatedDamage.max.toFixed()}
                    </Grid>
                    <Grid item xs={1}>
                        <Tooltip title="Critical hits deal 50% more damage.">
                            <Help/>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
        <Grid container>
            <Grid item xs={12}>
                <strong>Traits</strong>
            </Grid>
            <CharacterTraits character={props.character}/>
        </Grid>
        {config.mechanics.artifacts.enabled && <Grid container>
            <Grid item xs={12}>
                <strong>Artifacts</strong>
            </Grid>
            <Grid>
                {
                    JSON.stringify(props.character.items)
                }
            </Grid>
        </Grid>}
        <TacticsSection character={props.character}/>
    </Grid>

}