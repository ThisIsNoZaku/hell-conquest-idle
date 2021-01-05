import {Tactics} from "../../data/Tactics";
import Tooltip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import React from "react";

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
                    +{Tactics[props.tactic].modifiers.max_hit_damage_modifier * 100}% to Critical hit
                    damage
                </li>
            </Tooltip>}
        </ul>
    </Grid>
}