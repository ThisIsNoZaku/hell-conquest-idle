import Paper from "@material-ui/core/Paper";
import React from "react";
import Button from "@material-ui/core/Button";
import { useHistory } from "react-router-dom";

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
    return <div style={styles.root}>
        <Button onClick={() => history.push("/")} style={styles.buttons} variant="contained" color="secondary">
            Reincarnate
        </Button>
    </div>
}