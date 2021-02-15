import Grid from "@material-ui/core/Grid";
import React, {useMemo} from "react";
import {
    getGlobalState,
    getSpriteForCreature
} from "../../engine";
import {getConfigurationValue} from "../../config";
import {MemoizedCharacterAttributes as CharacterAttributes} from "./charactersheet/CharacterAttributes";
import CharacterTraits from "./charactersheet/CharacterTraits";
import Tooltip from "@material-ui/core/Tooltip";
import TacticsSection from "./charactersheet/TacticsSection";
import {Decimal} from "decimal.js";
import CharacterCombatStatistics from "./charactersheet/CharacterCombatStatistics";
import {Help} from "@material-ui/icons";
import {Traits} from "../../data/Traits";

export function CharacterSheet(props) {
    const spriteSrc = useMemo(() => getSpriteForCreature(props.appearance), [props.appearance]);

    return <Grid container>
        <Grid item xs={12}>
            <img src={spriteSrc} style={{height: "75px"}}/>
        </Grid>
        {<Grid item xs={12}>
            {props.characterName}
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
                    title="Inherited power increases damage, health and energy. Inherited power increases when you intimidate enemy demons or reincarnate and is soft-capped by the level of the strongest enemy you've defeated.">
                    <Help/>
                </Tooltip>
            </Grid>
            <Grid item xs>
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
            characterPowerLevel={props.characterPowerLevel}
            characterStamina={props.characterStamina}
            characterPower={props.characterPower}
            characterResilience={props.characterResilience}
            characterEvasion={props.characterEvasion}
            characterPrecision={props.characterPrecision}
            evasionMultiplier={props.attackDowngradeCost}
            characterEnergyGeneration={props.characterEnergyGeneration}
            precisionMultiplier={props.attackUpgradeCost}

            enemyPower={Decimal(props.enemyPower)}
            enemyResilience={Decimal(props.enemyResilience)}

            blockCost={props.blockCost}
            blockEffect={props.blockEffect}
            dodgeCost={props.dodgeCost}

            basicAttackCost={props.basicAttackCost}
            basicAttackDamage={props.basicAttackDamage}

            powerAttackCost={props.powerAttackCost}
            powerAttackDamage={props.powerAttackDamage}
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
        {props.isPc && <Grid container>
            <Grid item xs={12}>
                <strong>Your Rivals!</strong>
                <Tooltip title="These are the demons who have defeated you before and who you will encounter again at each level">
                    <Help/>
                </Tooltip>
            </Grid>
            {Object.keys(props.rivals).map(level => {
                const rival = getGlobalState().rivals[level];
                return <React.Fragment>
                    <Grid item xs={6}>
                        {level}
                    </Grid>
                    <Grid item xs={6}>
                        {rival.name} {Object.keys(rival.traits).map(traitId => {
                            return <Tooltip title={Traits[traitId].name + " - tier " + Decimal(rival.traits[traitId]).toFixed()}>
                                <img src={Traits[traitId].icon}/>
                            </Tooltip>
                    })}
                    </Grid>
                </React.Fragment>
            })}
        </Grid>}
    </Grid>

}

export const MemoizedCharacterSheet = React.memo(CharacterSheet);