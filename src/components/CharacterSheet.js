import Grid from "@material-ui/core/Grid";
import React, {useMemo} from "react";
import {
    evaluateExpression,
    getCharacter,
    getGlobalState,
    getPowerNeededForLevel,
    getSpriteForCreature
} from "../engine";
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
import CharacterCombatStatistics from "./charactersheet/CharacterCombatStatistics";

const styles = {
    tooltip: {
        fontSize: "12pt"
    }
}

export default function CharacterSheet(props) {
    const spriteSrc = useMemo(() => getSpriteForCreature(props.character.appearance), [props.character.appearance]);

    const powerRequiredForCurrentLevel = getPowerNeededForLevel(props.character.powerLevel);
    const powerNeededForNextLevel = getPowerNeededForLevel(props.character.powerLevel.plus(1));
    const progressToNextLevel = props.character.absorbedPower.minus(powerRequiredForCurrentLevel);
    const latentPowerModifier = useMemo(() => Decimal(props.character.latentPower.times(config.mechanics.reincarnation.latentPowerEffectScale).times(100)), [
        props.character.latentPower
    ]);

    const hitChances = useMemo(() => getHitChanceBy(props.character).against(props.enemy), [
        props.character,
        props.enemy
    ]);
    const calculatedDamage = useMemo(() => calculateDamageBy(props.character).against(props.enemy), [
        props.character,
        props.enemy
    ]);

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
            {props.character.latentPower.gte(getGlobalState().latentPowerCap) && props.character.isPc &&
            <Grid item xs style={{color: "red"}}>
                <Tooltip
                    title="Your latent power has been capped based on the power of the strongest demon you've defeated. Increase your cap by reincarnating after defeating stronger enemies.">
                    <div>
                        {latentPowerModifier.toFixed()}%
                    </div>
                </Tooltip>
            </Grid>}
            {(!props.character.latentPower.gte(getGlobalState().latentPowerCap) || !props.character.isPc) &&
            <Grid item xs>
                {latentPowerModifier.toFixed()}%
            </Grid>}
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
        <CharacterCombatStatistics
            hitChances={hitChances}
            calculatedDamage={calculatedDamage}
            characterPower={props.character.combat.power.toFixed()}
            characterResilience={props.character.combat.resilience.toFixed()}
            characterEvasion={props.character.combat.evasion.toFixed()}
            characterPrecision={props.character.combat.precision.toFixed()}/>
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
        <TacticsSection characterTactics={props.character.tactics}/>
    </Grid>

}