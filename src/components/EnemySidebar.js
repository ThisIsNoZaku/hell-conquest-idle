import React from "react";
import Paper from "@material-ui/core/Paper";
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

export default function EnemySidebar(props) {
    return <Paper style={!props.enemy || props.enemy.isAlive ? styles.alive : styles.dead}>
        {props.enemy && <CharacterSheet enemy={props.player} character={props.enemy} /> }
    </Paper>
}