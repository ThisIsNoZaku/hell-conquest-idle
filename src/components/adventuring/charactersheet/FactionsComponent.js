import React, {useContext} from "react";
import Paper from "@material-ui/core/Paper";
import {PlayerContext} from "../../scene/AdventuringPage";
import {Decimal} from "decimal.js";

export default function FactionsComponent(props) {
    const player = useContext(PlayerContext);
    return <Paper>
        {Decimal(player.highestLevelReached).lt(26) && <div>
            Feature Locked (Reach level 26)
        </div>}
    </Paper>
}