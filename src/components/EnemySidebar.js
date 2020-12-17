import React from "react";
import Paper from "@material-ui/core/Paper";
import CharacterSheet from "./CharacterSheet";

const styles = {
    root: {
        width: "25%",
        backgroundColor: "#eeeeee"
    }
}

export default function EnemySidebar(props) {
    return <Paper style={styles.root}>
        {props.currentEncounter && <CharacterSheet character={props.currentEncounter.enemies[0]} /> }
    </Paper>
}