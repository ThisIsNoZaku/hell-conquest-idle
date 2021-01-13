import Paper from "@material-ui/core/Paper";
import React from "react";
import CharacterSheet from "./CharacterSheet";

const styles = {
    alive: {
        width: "25%",
        backgroundColor: "#eeeeee"
    },
    dead: {
        width: "25%",
        backgroundColor: "#b3827f"
    }
}

export default function PlayerStats(props) {
    return <Paper style={!props.player || props.player.isAlive ? styles.alive : styles.dead}>
        <CharacterSheet character={props.player} enemy={props.enemy}/>
    </Paper>
}