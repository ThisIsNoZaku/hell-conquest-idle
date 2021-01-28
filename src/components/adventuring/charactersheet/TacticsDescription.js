import {Tactics} from "../../../data/Tactics";
import Tooltip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import React from "react";
import {HitTypes} from "../../../data/HitTypes";
import * as _ from "lodash";

export default function (props) {
    const modifiers = _.get(props.tactic, "modifiers", {});
    return <Grid container>
        <ul>
            {modifiers.power_modifier &&
            <Tooltip title="Power makes your hits deal additional damage.">
                <li style={{color: "green", textAlign: "left"}}>
                    +{modifiers.power_modifier * 100}% to Power
                </li>
            </Tooltip>}
            {modifiers.precision_modifier &&
            <Tooltip title="Precision makes your hits more severe.">
                <li style={{color: "green", textAlign: "left"}}>
                    +{modifiers.precision_modifier * 100}% to Precision
                </li>
            </Tooltip>}
            {modifiers.resilience_modifier &&
            <Tooltip title="Resilience makes you more resistant to damage.">
                <li style={{color: "green", textAlign: "left"}}>
                    +{modifiers.resilience_modifier * 100}% to Resilience
                </li>
            </Tooltip>}
            {modifiers.fatigue_multiplier &&
            <Tooltip title="Fatigue causes damage when combats last too long.">
                <li style={{color: "green", textAlign: "left"}}>
                    -{(1 - modifiers.fatigue_multiplier) * 100}% to Fatigue Damage
                </li>
            </Tooltip>}
            {modifiers.evasion_modifier &&
            <Tooltip title="Evasion makes incoming attacks less severe.">
                <li style={{color: "green", textAlign: "left"}}>
                    +{modifiers.evasion_modifier * 100}% to Evasion
                </li>
            </Tooltip>}
            {modifiers.devastating_hit_damage_multiplier &&
            <Tooltip title="Devastating hits deal extra damage">
                <li style={{color: "green", textAlign: "left"}}>
                    +{modifiers.devastating_hit_damage_multiplier * 100}% to {HitTypes[HitTypes.max].type} hit damage
                </li>
            </Tooltip>}
            {modifiers.solid_hit_received_damage_multiplier &&
            <Tooltip title="Solid hits are a standard hit.">
                <li style={{color: "green", textAlign: "left"}}>
                    {modifiers.solid_hit_received_damage_multiplier * 100}% to damage from {HitTypes[0].type} hits
                </li>
            </Tooltip>}
            {modifiers.health_modifier &&
            <Tooltip title="The demon is harder to kill">
                <li style={{color: "green", textAlign: "left"}}>
                    +{modifiers.health_modifier * 100}% to Health
                </li>
            </Tooltip>}
            {modifiers.downgrade_devastating_to_miss &&
            <Tooltip title="This Demon has a special effect when it downgrades an attack.">
                <li style={{textAlign: "left"}}>
                    <span style={{color: "green"}}>Downgrades Devastating hits to Misses</span>.
                </li>
            </Tooltip>}
            {modifiers.upgrade_to_devastating &&
            <Tooltip title="This demon has a special effect when it upgrades an attack.">
                <li style={{textAlign: "left"}}>
                    <span style={{color: "green"}}>Upgrading an attack</span>.
                </li>
            </Tooltip>}
            {modifiers.attack_downgrade_cost_multiplier &&
            <Tooltip title="The demon uses a different amount of points to reduce the severity of incoming attacks.">
                <li style={{color: modifiers.attack_downgrade_cost_multiplier > 0 ? "red" : "green", textAlign: "left"}}>
                    Multiplies cost to downgrade incoming attacks by {(1 + modifiers.attack_downgrade_cost_multiplier) * 100}%.
                </li>
            </Tooltip>}
            {modifiers.attack_upgrade_cost_multiplier &&
            <Tooltip title="The demon uses a different amount of points to increase the severity of their attacks.">
                <li style={{color: modifiers.attack_upgrade_cost_multiplier > 0 ? "red" : "green", textAlign: "left"}}>
                    Multiplies cost to upgrade attacks by {(1 + modifiers.attack_upgrade_cost_multiplier) * 100}%.
                </li>
            </Tooltip>}
            {props.tactic.strategy === "power" &&
            <li style={{color: "green", textAlign: "left"}}>
                Attack at full power all the time.
            </li>}
            {props.tactic.strategy === "attrition" &&
            <li style={{color: "green", textAlign: "left"}}>
                Make continuous small attacks to wear down the enemy.
            </li>}
            {props.tactic.strategy === "counter" &&
            <li style={{color: "green", textAlign: "left"}}>
                Conserves strength to make a few big hits when the enemy is worn down.
            </li>}
            {props.tactic.strategy === "none" &&
            <li style={{color: "green", textAlign: "left"}}>
                Don't bother trying to protect yourself.
            </li>}
            {props.tactic.strategy === "block" &&
            <li style={{color: "green", textAlign: "left"}}>
                Withstand enough damage to outlast the enemy while keeping on the offensive.
            </li>}
            {props.tactic.strategy === "dodge" &&
            <li style={{color: "green", textAlign: "left"}}>
                Maximise effort to minimize damage.
            </li>}
        </ul>
    </Grid>
}