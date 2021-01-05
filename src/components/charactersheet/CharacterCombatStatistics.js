import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import {Help} from "@material-ui/icons";
import React, {useMemo} from "react";
import {Decimal} from "decimal.js";
import {config} from "../../config";
import getHitChanceBy from "../../engine/combat/getHitChanceBy";
import calculateDamageBy from "../../engine/combat/calculateDamageBy";

export default function CharacterCombatStatistics(props) {
    const combinedHitWeights = useMemo(() => Object.values(props.hitChances).reduce((total, next) => total.plus(next)), [
        props.hitChances,
        props.calculatedDamage
    ]);
    const powerTooltip = useMemo(() => `Your Power increases the damage your attacks deal by ${Decimal(config.mechanics.combat.power.effectPerPoint).times(props.characterPower).times(100).toFixed()}%.`, [
        props.characterPower
    ]);
    const resilienceTooltip = useMemo(() => `Your Resilience reduces the damage attacks against you deal by ${Decimal(config.mechanics.combat.resilience.effectPerPoint).times(props.characterResilience).times(100).toFixed()}%.`, [
        props.characterResilience
    ]);
    return <Grid container>
        <Grid item xs={12}>
            <strong>Combat Statistics</strong>
        </Grid>
        <Grid container>
            <Tooltip title={powerTooltip}>
                <Grid item container>
                    <Grid item xs style={{textAlign: "center"}}>
                        Power
                    </Grid>
                    <Grid item xs>
                        {props.characterPower}
                    </Grid>
                </Grid>
            </Tooltip>
            <Tooltip title={resilienceTooltip}>
                <Grid item container>
                    <Grid item xs style={{textAlign: "center"}}>
                        Resilience
                    </Grid>
                    <Grid item xs>
                        {props.characterResilience}
                    </Grid>
                </Grid>
            </Tooltip>
            <Tooltip title={`Your Evasion reduces the severity of hits you take.`}>
                <Grid item container>
                    <Grid item xs style={{textAlign: "center"}}>
                        Evasion
                    </Grid>
                    <Grid item xs>
                        {props.characterEvasion}
                    </Grid>
                </Grid>
            </Tooltip>
            <Tooltip title={`Your Precision increases the severity of hits you score.`}>
                <Grid item container>
                    <Grid item xs style={{textAlign: "center"}}>
                        Precision
                    </Grid>
                    <Grid item xs>
                        {props.characterPrecision}
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
                    {props.hitChances.min.div(combinedHitWeights).times(100).toFixed(2)}%
                </Grid>
                <Grid item xs>
                    {props.calculatedDamage.min.toFixed()}
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
                    {props.hitChances.med.div(combinedHitWeights).times(100).toFixed(2)}%
                </Grid>
                <Grid item xs>
                    {props.calculatedDamage.med.toFixed()}
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
                    {props.hitChances.max.div(combinedHitWeights).times(100).toFixed(2)}%
                </Grid>
                <Grid item xs>
                    {props.calculatedDamage.max.toFixed()}
                </Grid>
                <Grid item xs={1}>
                    <Tooltip title="Critical hits deal 50% more damage.">
                        <Help/>
                    </Tooltip>
                </Grid>
            </Grid>
        </Grid>
    </Grid>
}