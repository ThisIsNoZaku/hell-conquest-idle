import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import {Help} from "@material-ui/icons";
import React, {useMemo} from "react";
import {Decimal} from "decimal.js";
import {config, getConfigurationValue} from "../../../config";
import {HitTypes} from "../../../data/HitTypes";
import calculateDamageBy from "../../../engine/combat/calculateDamageBy";
import calculateAttributeDifferentMultiplier from "../../../engine/combat/calculateAttributeDifferentMultiplier";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import {useMediaQuery, useTheme} from "@material-ui/core";

export default function CharacterCombatStatistics(props) {
    const powerTooltip = useMemo(() => `Your Power vs the enemy's Resilience modifies your damage by x${calculateAttributeDifferentMultiplier(props.characterPower, props.enemyResilience)}.`, [
        props.characterPower,
        props.enemyResilience
    ]);
    const resilienceTooltip = useMemo(() => `Your Resilience vs the enemy's Power modifies damage against you by x${calculateAttributeDifferentMultiplier(props.enemyPower, props.characterResilience)}.`, [
        props.characterResilience,
        props.enemyPower
    ]);
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("lg"));
    return <Grid container>
        <Grid item xs={12}>
            <strong>Combat Statistics</strong>
        </Grid>
        <TableContainer component={Paper}>
            {!smallScreen && <Table>
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
                            Max Energy
                        </TableCell>
                        <TableCell>
                            {props.characterStamina}
                        </TableCell>
                        <TableCell>
                            <Tooltip title="The maximum Energy you can have safely.">
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
                            Energy Regen
                        </TableCell>
                        <TableCell>
                            {props.characterEnergyGeneration.times(100).toFixed()}
                        </TableCell>
                        <TableCell>
                            <Tooltip title="Gain this much energy every 100 ticks of combat.">
                                <Help/>
                            </Tooltip>
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
                        {/*<TableCell>*/}
                        {/*    Downgrade Cost*/}
                        {/*</TableCell>*/}
                        {/*<TableCell>*/}
                        {/*    {props.evasionMultiplier.toFixed()}*/}
                        {/*</TableCell>*/}
                        {/*<TableCell>*/}
                        {/*    <Tooltip title="This is the amount of energy consumed to downgrade incoming attacks.">*/}
                        {/*        <Help/>*/}
                        {/*    </Tooltip>*/}
                        {/*</TableCell>*/}
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
                        {/*<TableCell>*/}
                        {/*    Upgrade Cost*/}
                        {/*</TableCell>*/}
                        {/*<TableCell>*/}
                        {/*    {props.precisionMultiplier.toFixed()}*/}
                        {/*</TableCell>*/}
                        {/*<TableCell>*/}
                        {/*    <Tooltip title="How much energy is consumed to downgrade incoming attacks">*/}
                        {/*        <Help/>*/}
                        {/*    </Tooltip>*/}
                        {/*</TableCell>*/}
                    </TableRow>
                </TableBody>
            </Table>}
            {smallScreen && <Table>
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
                    </TableRow>
                    <TableRow>
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
                    </TableRow>
                    {/*<TableRow>*/}
                    {/*    <TableCell>*/}
                    {/*        Downgrade Cost*/}
                    {/*    </TableCell>*/}
                    {/*    <TableCell>*/}
                    {/*        {props.evasionMultiplier.toFixed()}*/}
                    {/*    </TableCell>*/}
                    {/*    <TableCell>*/}
                    {/*        <Tooltip title="This is the amount of energy consumed to downgrade incoming attacks.">*/}
                    {/*            <Help/>*/}
                    {/*        </Tooltip>*/}
                    {/*    </TableCell>*/}
                    {/*</TableRow>*/}
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
                    </TableRow>
                    {/*<TableRow>*/}
                    {/*    <TableCell>*/}
                    {/*        Upgrade Cost*/}
                    {/*    </TableCell>*/}
                    {/*    <TableCell>*/}
                    {/*        {props.precisionMultiplier.toFixed()}*/}
                    {/*    </TableCell>*/}
                    {/*    <TableCell>*/}
                    {/*        <Tooltip title="How much energy is consumed to downgrade incoming attacks">*/}
                    {/*            <Help/>*/}
                    {/*        </Tooltip>*/}
                    {/*    </TableCell>*/}
                    {/*</TableRow>*/}
                </TableBody>
            </Table>}
        </TableContainer>
        <Grid container>
            <Grid item container xs={12}>
                <Grid item xs><strong>Attack Type</strong></Grid>
                <Grid item xs><strong>Cost</strong></Grid>
                <Grid item xs><strong>Dmg.</strong></Grid>
            </Grid>
            <Grid item container xs={12}>
                <Grid item xs><strong>Basic Attack</strong></Grid>
                <Grid item xs>{props.basicAttackCost}</Grid>
                <Grid item xs>{props.basicAttackDamage}</Grid>
            </Grid>
            <Grid item container xs={12}>
                <Grid item xs><strong>Power Attack</strong></Grid>
                <Grid item xs>{props.powerAttackCost}</Grid>
                <Grid item xs>{props.powerAttackDamage}</Grid>
            </Grid>
        </Grid>
        <Grid container>
            <Grid item container xs={12}>
                <Grid item xs><strong>Defense Type</strong></Grid>
                <Grid item xs><strong>Cost</strong></Grid>
                <Grid item xs><strong>Effect</strong></Grid>
            </Grid>
            <Grid item container xs={12}>
                <Grid item xs><strong>Block</strong></Grid>
                <Grid item xs>{props.blockCost}</Grid>
                <Grid item xs>{props.blockEffect}% Damage</Grid>
            </Grid>
            <Grid item container xs={12}>
                <Grid item xs><strong>Dodge</strong></Grid>
                <Grid item xs>{props.dodgeCost}</Grid>
                <Grid item xs>Attack Misses</Grid>
            </Grid>
        </Grid>
    </Grid>
}