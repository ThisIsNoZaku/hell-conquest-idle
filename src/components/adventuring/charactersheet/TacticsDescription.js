import {Tactics} from "../../../data/Tactics";
import Tooltip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import React from "react";
import {HitTypes} from "../../../data/HitTypes";

export default function (props) {
    return <Grid container>
        <ul>
            {Tactics[props.tactic].modifiers.power_modifier &&
            <Tooltip title="Power makes your hits deal additional damage.">
                <li style={{color: "green", textAlign: "left"}}>
                    +{Tactics[props.tactic].modifiers.power_modifier * 100}% to Power
                </li>
            </Tooltip>}
            {Tactics[props.tactic].modifiers.precision_modifier &&
            <Tooltip title="Precision makes your hits more severe.">
                <li style={{color: "green", textAlign: "left"}}>
                    +{Tactics[props.tactic].modifiers.precision_modifier * 100}% to Precision
                </li>
            </Tooltip>}
            {Tactics[props.tactic].modifiers.resilience_modifier &&
            <Tooltip title="Resilience makes you more resistant to damage.">
                <li style={{color: "green", textAlign: "left"}}>
                    +{Tactics[props.tactic].modifiers.resilience_modifier * 100}% to Resilience
                </li>
            </Tooltip>}
            {Tactics[props.tactic].modifiers.fatigue_multiplier &&
            <Tooltip title="Fatigue causes damage when combats last too long.">
                <li style={{color: "green", textAlign: "left"}}>
                    -{(1 - Tactics[props.tactic].modifiers.fatigue_multiplier) * 100}% to Fatigue Damage
                </li>
            </Tooltip>}
            {Tactics[props.tactic].modifiers.evasion_modifier &&
            <Tooltip title="Evasion makes incoming attacks less severe.">
                <li style={{color: "green", textAlign: "left"}}>
                    +{Tactics[props.tactic].modifiers.evasion_modifier * 100}% to Evasion
                </li>
            </Tooltip>}
            {Tactics[props.tactic].modifiers.devastating_hit_damage_multiplier &&
            <Tooltip title="Devastating hits deal extra damage">
                <li style={{color: "green", textAlign: "left"}}>
                    +{Tactics[props.tactic].modifiers.devastating_hit_damage_multiplier * 100}% to {HitTypes[HitTypes.max].type} hit damage
                </li>
            </Tooltip>}
            {Tactics[props.tactic].modifiers.solid_hit_received_damage_multiplier &&
            <Tooltip title="Solid hits are a standard hit.">
                <li style={{color: "green", textAlign: "left"}}>
                    {Tactics[props.tactic].modifiers.solid_hit_received_damage_multiplier * 100}% to damage from {HitTypes[0].type} hits
                </li>
            </Tooltip>}
            {Tactics[props.tactic].modifiers.health_modifier &&
            <Tooltip title="The demon is harder to kill">
                <li style={{color: "green", textAlign: "left"}}>
                    +{Tactics[props.tactic].modifiers.health_modifier * 100}% to Health
                </li>
            </Tooltip>}
            {Tactics[props.tactic].modifiers.downgrade_devastating_to_miss &&
            <Tooltip title="This Demon has a special effect when it downgrades an attack.">
                <li style={{textAlign: "left"}}>
                    <span style={{color: "green"}}>Downgrades Devastating hits to Misses,</span><span style={{color: "red"}}> but does not downgrade Solid hits</span>.
                </li>
            </Tooltip>}
            {Tactics[props.tactic].modifiers.upgrade_to_devastating &&
            <Tooltip title="This demon has a special effect when it upgrades an attack.">
                <li style={{textAlign: "left"}}>
                    <span style={{color: "green"}}>Upgrading an attack</span>.
                </li>
            </Tooltip>}
            {Tactics[props.tactic].modifiers.attack_downgrade_cost_multiplier &&
            <Tooltip title="The demon uses a different amount of points to reduce the severity of incoming attacks.">
                <li style={{color: Tactics[props.tactic].modifiers.attack_downgrade_cost_multiplier > 0 ? "red" : "green", textAlign: "left"}}>
                    Multiplies cost to downgrade incoming attacks by {(1 + Tactics[props.tactic].modifiers.attack_downgrade_cost_multiplier) * 100}%.
                </li>
            </Tooltip>}
            {Tactics[props.tactic].modifiers.attack_upgrade_cost_multiplier &&
            <Tooltip title="The demon uses a different amount of points to increase the severity of their attacks.">
                <li style={{color: Tactics[props.tactic].modifiers.attack_upgrade_cost_multiplier > 0 ? "red" : "green", textAlign: "left"}}>
                    Multiplies cost to upgrade attacks by {(1 + Tactics[props.tactic].modifiers.attack_upgrade_cost_multiplier) * 100}%.
                </li>
            </Tooltip>}
            {Tactics[props.tactic].strategy.attack === "always" &&
            <li style={{color: "green", textAlign: "left"}}>
                Always try to spend Energy to upgrade attacks up to two times.
            </li>}
            {Tactics[props.tactic].strategy.attack === "cautious" &&
            <li style={{color: "green", textAlign: "left"}}>
                Always spend Energy to upgrade attacks one time.
            </li>}
            {Tactics[props.tactic].strategy.attack === "advantage" &&
            <li style={{color: "green", textAlign: "left"}}>
                Spend Energy to upgrade attacks once when has more than Enemy.
            </li>}
            {Tactics[props.tactic].strategy.defend === "always" &&
            <li style={{color: "green", textAlign: "left"}}>
                Always try to spend Energy to downgrade incoming attacks once.
            </li>}
            {Tactics[props.tactic].strategy.defend === "advantage" &&
            <li style={{color: "green", textAlign: "left"}}>
                Spend Energy to downgrade incoming attack once if you have more than the Enemy.
            </li>}
            {Tactics[props.tactic].strategy.defend === "upgraded" &&
            <li style={{color: "green", textAlign: "left"}}>
                Spend Energy to downgrade incoming attack once if the Enemy upgraded their attack.
            </li>}
        </ul>
    </Grid>
}