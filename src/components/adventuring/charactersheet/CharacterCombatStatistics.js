import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import {Help} from "@material-ui/icons";
import React, {useMemo} from "react";
import {Decimal} from "decimal.js";
import {config} from "../../../config";
import {HitTypes} from "../../../data/HitTypes";
import calculateDamageBy from "../../../engine/combat/calculateDamageBy";
import calculateAttributeDifferentMultiplier from "../../../engine/combat/calculateAttributeDifferentMultiplier";

export default function CharacterCombatStatistics(props) {
    const powerTooltip = useMemo(() => `Your Power vs the enemy's Resilience modifies your damage by x${calculateAttributeDifferentMultiplier(props.characterPower, props.enemyResilience)}.`, [
        props.characterPower,
        props.enemyResilience
    ]);
    const resilienceTooltip = useMemo(() => `Your Resilience vs the enemy's Power modifies damage against you by x${calculateAttributeDifferentMultiplier(props.enemyPower, props.enemyResilience)}.`, [
        props.characterResilience,
        props.enemyPower
    ]);
    return <Grid container>
        <Grid item xs={12}>
            <strong>Combat Statistics</strong>
        </Grid>
        <Grid container item xs direction="column">
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
        </Grid>
        <Grid container item xs direction="column">
            <Grid container style={{visibility: "hidden"}}>
                a
            </Grid>
            <Grid container style={{visibility: "hidden"}}>
                a
            </Grid>
            <Grid container direction="row">
                <Grid item xs>
                    Ev. Pool
                </Grid>
                <Grid item xs>
                    {props.characterEvasionPoints}
                </Grid>
            </Grid>
            <Grid container direction="row">
                <Grid item xs>
                    Acc. Pool
                </Grid>
                <Grid item xs>
                    {props.characterAccuracyPoints}
                </Grid>
            </Grid>
        </Grid>
        <Grid container>
            <Grid item xs={12}>
                <strong>Hit Types</strong>
            </Grid>
            <Grid item container xs={12}>
                <Grid item xs><em>Type</em></Grid>
                <Grid item xs><em>Damage</em></Grid>
                <Grid item xs={1}></Grid>
            </Grid>
            {Object.keys(HitTypes).map(type => {
                return <Grid item container xs={12}>
                    <Grid item xs><em>{HitTypes[type].type}</em></Grid>
                    <Grid item xs><em>{props.calculatedDamage[type].toFixed()}</em></Grid>
                    <Grid item xs={1}>
                        <Tooltip title={`${HitTypes[type].type} deals ${HitTypes[type].damageMultiplier * 100}% of base damage.`}>
                            <Help/>
                        </Tooltip>
                    </Grid>
                </Grid>
            })}
        </Grid>
        <Grid container>

        </Grid>
    </Grid>
}