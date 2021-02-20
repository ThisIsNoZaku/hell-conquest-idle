import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import {Help} from "@material-ui/icons";
import React, {useContext, useMemo} from "react";
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
import {ActionEnhancements} from "../../../data/ActionEnhancements";
import {EnemyContext, PlayerContext} from "../../scene/AdventuringPage";
import {calculateActionCost} from "../../../engine/combat/actions/calculateActionCost";
import * as _ from "lodash";

export default function CharacterCombatStatistics(props) {
    const character = useContext(props.isPc ? PlayerContext : EnemyContext);
    const enemy = useContext(props.isPc ? EnemyContext : PlayerContext);

    const defenseArgs = [
        _.get(enemy, "powerLevel", Decimal(0)).toFixed(),
        _.get(character, ["combat", "evasion"], Decimal(0)).toFixed(),
        JSON.stringify(_.get(character, "defenseEnhancements")),
        JSON.stringify(_.get(character, "traits")),
        JSON.stringify(_.get(enemy, "traits"))
    ];
    const attackArgs = [
        _.get(enemy, "powerLevel", Decimal(0)).toFixed(),
        _.get(character, ["combat", "precision"], Decimal(0)).toFixed(),
        JSON.stringify(_.get(character, "attackEnhancements")),
        JSON.stringify(_.get(character, "traits")),
        JSON.stringify(_.get(enemy, "traits"))
    ];

    const powerTooltip = useMemo(() => `Your Power vs the enemy's Resilience modifies your damage by x${calculateAttributeDifferentMultiplier(_.get(character, ["combat", "power"], Decimal(0)), _.get(enemy, ["combat", "resilience"], Decimal(0)))}.`, [
        _.get(character, ["combat", "power"], Decimal(0)).toFixed(),
        _.get(enemy, ["combat", "resilience"], Decimal(0)).toFixed()
    ]);
    const resilienceTooltip = useMemo(() => `Your Resilience vs the enemy's Power modifies damage against you by x${calculateAttributeDifferentMultiplier(_.get(enemy, ["combat", "power"], Decimal(0)), _.get(character, ["combat", "resilience"], Decimal(0)))}.`, [
        _.get(character, ["combat", "resilience"], Decimal(0)).toFixed(),
        _.get(enemy, ["combat", "power"], Decimal(0)).toFixed()
    ]);
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("lg"));

    const blockCost = useMemo(() => calculateActionCost(character, {primary: "block", enhancements: _.get(character, "defenseEnhancements", [])}, enemy).toFixed(),
        defenseArgs);
    const blockEffect = Decimal(HitTypes[-1].damageMultiplier).plus(_.get(character, "attackEnhancements", []).reduce((total, enhance)=>{
        return total + (enhance.additional_block_damage_reduction || 0);
    }, 0)).times(100).toFixed();
    const dodgeCost = useMemo(() => calculateActionCost(character, {primary: "dodge", enhancements: _.get(character, "defenseEnhancements", [])}, enemy).toFixed(),
        defenseArgs);

    const basicAttackCost = useMemo(() => calculateActionCost(character, {primary: "basicAttack", enhancements: _.get(character, "attackEnhancements", [])}, enemy).toFixed(),
        attackArgs);
    const basicAttackDamage = calculateDamageBy(character).using({primary: "basicAttack", enhancements: _.get(character, "attackEnhancements", [])})
        .against(enemy).using({primary: "none", enhancements: _.get(enemy, ["defenseEnhancements"], [])})[0].toFixed();

    const powerAttackCost = useMemo(() => calculateActionCost(character, {primary: "powerAttack", enhancements: _.get(character, "attackEnhancements", [])}, enemy).toFixed(),
        attackArgs);
    const powerAttackDamage = calculateDamageBy(character).using({primary: "powerAttack", enhancements: _.get(character, "attackEnhancements", [])})
        .against(enemy).using({primary: "none", enhancements: _.get(enemy, ["defenseEnhancements"], [])})[1].toFixed();
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
                            {character.combat.power.toFixed()}
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
                            {character.combat.maximumStamina.toFixed()}
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
                            {character.combat.resilience.toFixed()}
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
                            {character.energyGeneration.toFixed()}
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
                            {character.combat.evasion.toFixed()}
                        </TableCell>
                        <TableCell>
                            <Tooltip title={`This character's evasion reduces the energy cost to downgrade attacks.`}>
                                <Help/>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Precision
                        </TableCell>
                        <TableCell>
                            {character.combat.precision.toFixed()}
                        </TableCell>
                        <TableCell>
                            <Tooltip title="Precision reduces the energy cost to upgrade attacks.">
                                <Help/>
                            </Tooltip>
                        </TableCell>
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
                            {character.combat.power.toFixed()}
                        </TableCell>
                        <TableCell>
                            <Tooltip title={powerTooltip}>
                                <Help/>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Resilience
                        </TableCell>
                        <TableCell>
                            {character.combat.resilience.toFixed()}
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
                            {character.combat.evasion.toFixed()}
                        </TableCell>
                        <TableCell>
                            <Tooltip title={`This character's evasion reduces the energy cost to downgrade attacks.`}>
                                <Help/>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Precision
                        </TableCell>
                        <TableCell>
                            {character.combat.precision.toFixed()}
                        </TableCell>
                        <TableCell>
                            <Tooltip title="Precision reduces the energy cost to upgrade attacks.">
                                <Help/>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Max Energy
                        </TableCell>
                        <TableCell>
                            {character.combat.maximumStamina.toFixed()}
                        </TableCell>
                        <TableCell>
                            <Tooltip title="Energy is used to perform various actions and trigger special effects">
                                <Help/>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Energy Regen
                        </TableCell>
                        <TableCell>
                            {character.energyGeneration.toFixed()}
                        </TableCell>
                        <TableCell>
                            <Tooltip title="Gain this much energy every 100 ticks of combat.">
                                <Help/>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
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
                <Grid item xs>{basicAttackCost}</Grid>
                <Grid item xs>{basicAttackDamage}</Grid>
            </Grid>
            <Grid item container xs={12}>
                <Grid item xs><strong>Power Attack</strong></Grid>
                <Grid item xs>{powerAttackCost}</Grid>
                <Grid item xs>{powerAttackDamage}</Grid>
            </Grid>
            <Grid container>
                <Grid item style={{textAlign: "center"}} xs={12}>
                    Attack Enhancements
                </Grid>
                <Grid item container xs={12}>
                    {character.attackEnhancements.map(enhancement => {
                        return <Grid item>
                            {ActionEnhancements[enhancement.enhancement].name}
                        </Grid>
                    })}
                </Grid>
                <Grid item xs={12}>
                    {character.attackEnhancements.length == 0 && "None"}
                </Grid>
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
                <Grid item xs>{blockCost}</Grid>
                <Grid item xs>{blockEffect}% Damage</Grid>
            </Grid>
            <Grid item container xs={12}>
                <Grid item xs><strong>Dodge</strong></Grid>
                <Grid item xs>{dodgeCost}</Grid>
                <Grid item xs>Attack Misses</Grid>
            </Grid>
            <Grid container>
                <Grid item style={{textAlign: "center"}} xs={12}>
                    Defense Enhancements
                </Grid>
                <Grid item container xs={12}>
                    {character.defenseEnhancements.map(enhancement => {
                        return <Grid item>
                            {ActionEnhancements[enhancement.enhancement].name}
                        </Grid>
                    })}
                </Grid>
                <Grid item xs={12}>
                    {character.defenseEnhancements.length == 0 && "None"}
                </Grid>
            </Grid>
        </Grid>
    </Grid>
}