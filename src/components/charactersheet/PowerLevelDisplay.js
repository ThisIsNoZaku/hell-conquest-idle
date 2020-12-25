import Grid from "@material-ui/core/Grid";
import React, {useMemo} from "react";

export default function PowerLevelDisplay(props) {
    const powerLevelDisplay = useMemo(() => props.powerLevel.toFixed(), [props.powerLevel]);
    return <React.Fragment>
        <Grid item xs={6}>
            Level
        </Grid>
        <Grid item xs={6}>
            {powerLevelDisplay}
        </Grid>
    </React.Fragment>
}