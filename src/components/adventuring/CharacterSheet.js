import Grid from "@material-ui/core/Grid";
import React, {useMemo} from "react";
import * as _ from "lodash";
import {
    getGlobalState,
    getSpriteForCreature
} from "../../engine";
import {getConfigurationValue} from "../../config";
import CharacterAttributes from "./charactersheet/CharacterAttributes";
import CharacterTraits from "./charactersheet/CharacterTraits";
import Tooltip from "@material-ui/core/Tooltip";
import TacticsSection from "./charactersheet/TacticsSection";
import calculateDamageBy from "../../engine/combat/calculateDamageBy";
import {Decimal} from "decimal.js";
import CharacterCombatStatistics from "./charactersheet/CharacterCombatStatistics";
import getPowerNeededForLevel from "../../engine/general/getPowerNeededForLevel";
import {Help} from "@material-ui/icons";
import calculateAttackDowngradeCost from "../../engine/combat/calculateAttackDowngradeCost";
import calculateAttackUpgradeCost from "../../engine/combat/calculateAttackUpgradeCost";

export default function CharacterSheet(props) {
    const spriteSrc = useMemo(() => getSpriteForCreature(props.character.appearance), [props.character.appearance]);

    const powerNeededForNextLevel = getPowerNeededForLevel(props.character.powerLevel.plus(1));
    const progressToNextLevel = Decimal(props.character.absorbedPower);
    const latentPowerModifier = useMemo(() => Decimal(props.character.latentPower.times(getConfigurationValue("latent_power_effect_scale")).times(100)), [
        props.character.latentPower
    ]);

    const calculatedDamage = useMemo(() => calculateDamageBy(props.character).against(props.enemy), [
        props.character,
        props.enemy
    ]);

    return <Grid container>
        <Grid item xs={12}>
            <img src={spriteSrc} style={{height: "75px"}}/>
        </Grid>
        {props.character.id !== 0 && <Grid item xs={12}>
            {props.character.adjectives.map(a => a.name).join(" ")} {props.character.name}
        </Grid>}
        <Grid item container>
            <Grid item xs>
                Level
            </Grid>
            <Grid item xs>
                {props.character.powerLevel.toFixed()}
            </Grid>
            <Grid item xs>
                Inherited Power Bonus
                <Tooltip
                    title="Inherited power multiplies power gain and attributes. Inherited power increases when you reincarnate and is capped based on the strongest enemy defeated.">
                    <Help/>
                </Tooltip>
            </Grid>
            <Grid item xs >
                    <div style={{color: latentPowerModifier.eq(getGlobalState().latentPowerCap) ? "red" : "inherit"}}>
                        {latentPowerModifier.toFixed()}%
                    </div>
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
        <CharacterCombatStatistics
            characterStamina={props.character.combat.stamina}
            calculatedDamage={calculatedDamage}
            characterPower={props.character.combat.power.toFixed()}
            characterResilience={props.character.combat.resilience.toFixed()}
            characterEvasion={props.character.combat.evasion.toFixed()}
            characterPrecision={props.character.combat.precision.toFixed()}
            evasionMultiplier={calculateAttackDowngradeCost(props.enemy, props.character)}
            precisionMultiplier={calculateAttackUpgradeCost(props.character, props.enemy)}
            enemyPower={Decimal(_.get(props.enemy, ["combat", "power"], 0)).toFixed()}
            enemyResilience={Decimal(_.get(props.enemy, ["combat", "resilience"], 0)).toFixed()}
        />
        <Grid container>
            <Grid item xs={12}>
                <strong>Traits</strong>
            </Grid>
            <CharacterTraits character={props.character}/>
        </Grid>
        {getConfigurationValue("artifacts_enabled") && <Grid container>
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