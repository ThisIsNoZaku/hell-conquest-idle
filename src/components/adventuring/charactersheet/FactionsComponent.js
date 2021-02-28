import React, {useContext} from "react";
import Paper from "@material-ui/core/Paper";
import {PlayerContext} from "../../scene/AdventuringPage";
import {Decimal} from "decimal.js";
import {Factions, ReputationLevels} from "../../../data/Factions";
import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import {getGlobalState} from "../../../engine";
import {getConfigurationValue} from "../../../config";

export default function FactionsComponent(props) {
    const player = useContext(PlayerContext);
    const factions = Object.keys(Factions);
    const what = Decimal(player.highestLevelReached).gte(26);
    return <Paper {...props}>
        {Decimal(player.highestLevelReached).lt(26) && <div>
            Feature Locked (Reach level 26)
        </div>}
        {what &&
        <Grid container>
            {factions.map(faction => {
                return <Grid item container xs={6} direction="column">
                    <Grid item>
                        <Tooltip title={Factions[faction].description}>
                            <img src={Factions[faction].icon}></img>
                        </Tooltip>
                    </Grid>
                    <Grid item>
                        {getGlobalState().factions[faction] >= getConfigurationValue("good_reputation_threshold") &&
                        <Tooltip title="Trusted - Negotiate with members to gain bonuses.">
                            <img src={ReputationLevels.good}></img>
                        </Tooltip>}
                        {getGlobalState().factions[faction] <= getConfigurationValue("bad_reputation_threshold") &&
                        <Tooltip title="Hated - Members attack on sight. Kill members of other faction to improve your reputation with this one.">
                            <img src={ReputationLevels.bad}></img>
                        </Tooltip>}
                        {getGlobalState().factions[faction] < getConfigurationValue("good_reputation_threshold") && getGlobalState().factions[faction] > getConfigurationValue("bad_reputation_threshold") &&
                        <Tooltip title="Neutral - Members will not attack you. Negotiate with members to improve your standing.">
                            <img src={ReputationLevels.neutral}></img>
                        </Tooltip>
                        }
                    </Grid>
                </Grid>
            })}
        </Grid>


        }
    </Paper>
}