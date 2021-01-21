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
            {Tactics[props.tactic].modifiers.max_hit_damage_modifier &&
            <Tooltip title="Critical hits deal extra damage">
                <li style={{color: "green", textAlign: "left"}}>
                    +{Tactics[props.tactic].modifiers.max_hit_damage_modifier * 100}% to {HitTypes[HitTypes.max].type} hit damage
                </li>
            </Tooltip>}
            {Tactics[props.tactic].modifiers.health_modifier &&
            <Tooltip title="The demon is harder to kill">
                <li style={{color: "green", textAlign: "left"}}>
                    +{Tactics[props.tactic].modifiers.health_modifier * 100}% to Health
                </li>
            </Tooltip>}
            {Tactics[props.tactic].modifiers.attack_upgrade_cost_multiplier &&
            <Tooltip title="The demon's attacks are easier to upgrade in severity">
                <li style={{color: "green", textAlign: "left"}}>
                    Multiplies cost to upgrade attacks by {Tactics[props.tactic].modifiers.attack_upgrade_cost_multiplier * 100}%.
                </li>
            </Tooltip>}
            {Tactics[props.tactic].modifiers.always_downgrade_to_glancing &&
            <Tooltip title="When the demon downgrades both Critical and Solid hits to reduced to Glancing.">
                <li style={{color: "green", textAlign: "left"}}>
                    Downgrades both Devastating and Solid hits to Misses.
                </li>
            </Tooltip>}
            {Tactics[props.tactic].modifiers.attack_downgrade_cost_multiplier &&
            <Tooltip title="The demon uses a different amount of points to reduce the severity of incoming attacks.">
                <li style={{color: Tactics[props.tactic].modifiers.attack_downgrade_cost_multiplier > 1 ? "red" : "green", textAlign: "left"}}>
                    Multiplies cost to downgrade incoming attacks by {Tactics[props.tactic].modifiers.attack_downgrade_cost_multiplier * 100}%.
                </li>
            </Tooltip>}
        </ul>
    </Grid>
}