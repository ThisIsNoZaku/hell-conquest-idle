import React from "react";
import ExplorationScene from "./scene/ExplorationScene";

export default function GameScreen(props) {
    switch (props.scene) {
        case 1:
            return <ExplorationScene {...props}/>;
        default:
            throw new Error();
    }
}