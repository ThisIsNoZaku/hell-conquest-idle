import Paper from "@material-ui/core/Paper";
import React from "react";
import CharacterSheet from "./CharacterSheet";

const styles = {
    root: {
        width: "25%",
        backgroundColor: "#eeeeee"
    }
}

export default function PlayerStats(props) {
    return <Paper style={styles.root} elevation={2}>
        <CharacterSheet character={props.player}/>
    </Paper>
}