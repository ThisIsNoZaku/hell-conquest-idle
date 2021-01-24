import Grid from "@material-ui/core/Grid";
import React, {useMemo} from "react";
import * as _ from "lodash";
import {
    getSpriteForCreature
} from "../../engine";
import {getConfigurationValue} from "../../config";
import {MemoizedCharacterAttributes as CharacterAttributes} from "./charactersheet/CharacterAttributes";
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

export function CharacterSheet(props) {
    const spriteSrc = useMemo(() => getSpriteForCreature(props.appearance), [props.appearance]);

    return <Grid container>
        <Grid item xs={12}>
            <img src={spriteSrc} style={{height: "75px"}}/>
        </Grid>
        { <Grid item xs={12}>
            {props.characterAdjectives.map(a => a.name).join(" ")} {props.characterName}
        </Grid>}
        <Grid item container>
            <Grid item xs>
                Level
            </Grid>
            <Grid item xs>
                {props.characterPowerLevel}
            </Grid>
            <Grid item xs>
                Inherited Power Bonus
                <Tooltip
                    title="Inherited power increases attributes and multiplies gained power and Health. Inherited power increases when you intimidate enemy demons and is soft-capped by the level of the strongest enemy you've defeated.">
                    <Help/>
                </Tooltip>
            </Grid>
            <Grid item xs >
                    <div style={{color: props.latentPower.gte(props.latentPowerCap) ? "orange" : "inherit"}}>
                        {props.latentPowerModifier}%
                    </div>
            </Grid>
        </Grid>
        {props.characterAbsorbedPower !== undefined && <Grid item xs={12}>
            <progress
                value={Decimal(props.progressToNextLevel).div(props.powerNeededForNextLevel).times(100).toNumber()}
                max={100}
                title={`${props.progressToNextLevel}/${props.powerNeededForNextLevel}`}
            ></progress>
        </Grid>}
        <Grid container>
            <Grid item container>
                <Grid item xs>
                    <strong>Attributes</strong>
                </Grid>
            </Grid>
            <CharacterAttributes
                hp={props.characterHp}
                maximumHp={props.characterMaximumHp}
                characterAttributes={props.characterAttributes}
            />
        </Grid>
        <CharacterCombatStatistics
            characterStamina={props.characterStamina}
            calculatedDamage={props.calculatedDamage}
            characterPower={props.characterPower}
            characterResilience={props.characterResilience}
            characterEvasion={props.characterEvasion}
            characterPrecision={props.characterPrecision}
            evasionMultiplier={props.attackDowngradeCost}
            precisionMultiplier={props.attackUpgradeCost}
            enemyPower={Decimal(_.get(props.enemy, ["combat", "power"], 0)).toFixed()}
            enemyResilience={Decimal(_.get(props.enemy, ["combat", "resilience"], 0)).toFixed()}
        />
        <Grid container>
            <Grid item xs={12}>
                <strong>Traits</strong>
            </Grid>
            <CharacterTraits characterTraits={props.characterTraits}/>
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
        <TacticsSection characterTactics={props.characterTactics}/>
    </Grid>

}

export const MemoizedCharacterSheet = React.memo(CharacterSheet);