import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import {Help} from "@material-ui/icons";
import React, {useMemo} from "react";
import {Decimal} from "decimal.js";
import {config} from "../../../config";
import {HitTypes} from "../../../data/HitTypes";
import calculateDamageBy from "../../../engine/combat/calculateDamageBy";
import calculateAttributeDifferentMultiplier from "../../../engine/combat/calculateAttributeDifferentMultiplier";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";

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
        <TableContainer component={Paper}>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            Power
                        </TableCell>
                        <TableCell>
                            {props.characterPower}
                        </TableCell>
                        <TableCell>
                            <Tooltip title={powerTooltip}>
                                <Help/>
                            </Tooltip>
                        </TableCell>
                        <TableCell>
                            Energy
                        </TableCell>
                        <TableCell>
                            {props.characterStamina}
                        </TableCell>
                        <TableCell>
                            <Tooltip title="Energy is used to perform various actions and trigger special effects">
                                <Help/>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Resilience
                        </TableCell>
                        <TableCell>
                            {props.characterResilience}
                        </TableCell>
                        <TableCell>
                            <Tooltip title={resilienceTooltip}>
                                <Help/>
                            </Tooltip>
                        </TableCell>
                        <TableCell>

                        </TableCell>
                        <TableCell>

                        </TableCell>
                        <TableCell>

                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Evasion
                        </TableCell>
                        <TableCell>
                            {props.characterEvasion}
                        </TableCell>
                        <TableCell>
                            <Tooltip title={`This character's evasion reduces the energy cost to downgrade attacks.`}>
                                <Help/>
                            </Tooltip>
                        </TableCell>
                        <TableCell>
                            Downgrade Cost
                        </TableCell>
                        <TableCell>
                            {props.evasionMultiplier.toFixed()}
                        </TableCell>
                        <TableCell>
                            <Tooltip title="This is the amount of energy consumed to downgrade incoming attacks.">
                                <Help/>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Precision
                        </TableCell>
                        <TableCell>
                            {props.characterPrecision}
                        </TableCell>
                        <TableCell>
                            <Tooltip title="Precision reduces the energy cost to upgrade attacks.">
                                <Help/>
                            </Tooltip>
                        </TableCell>
                        <TableCell>
                            Upgrade Cost
                        </TableCell>
                        <TableCell>
                            {props.precisionMultiplier.toFixed()}
                        </TableCell>
                        <TableCell>
                            <Tooltip title="How much energy is consumed to downgrade incoming attacks">
                                <Help/>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
        <Grid container>
            <Grid item xs={12}>
                <strong>Hit Types</strong>
            </Grid>
            <Grid item container xs={12}>
                <Grid item xs><em>Type</em></Grid>
                <Grid item xs><em>Damage</em></Grid>
                <Grid item xs={1}></Grid>
            </Grid>
            {[-1, -0, 1].map(type => {
                return <Grid item container xs={12}>
                    <Grid item xs><em>{HitTypes[type].type}</em></Grid>
                    <Grid item xs><em>{props.calculatedDamage[type].toFixed()}</em></Grid>
                    <Grid item xs={1}>
                        <Tooltip
                            title={`${HitTypes[type].type} deals ${HitTypes[type].damageMultiplier * 100}% of base damage.`}>
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