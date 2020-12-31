import Paper from "@material-ui/core/Paper";
import React, {useMemo} from "react";
import Button from "@material-ui/core/Button";
import { useHistory } from "react-router-dom";
import {getCharacter, getGlobalState, getLevelForPower, getPowerNeededForLevel} from "../engine";

const styles = {
    root: {
        height: "100%",
        display: "flex",
        flex: "0"
    },
    buttons: {
        width: "100%"
    }
}

export default function TopSection(props) {
    const history = useHistory();
    const reincarnateEnabled = useMemo(() => getCharacter(0).powerLevel.gt(1), [
        getCharacter(0).powerLevel
    ])
    return <div style={styles.root}>
        <Button onClick={() => history.push("/reincarnating")} style={styles.buttons} variant="contained" color="secondary" disabled={!reincarnateEnabled}>
            Reincarnate
        </Button>
    </div>
}