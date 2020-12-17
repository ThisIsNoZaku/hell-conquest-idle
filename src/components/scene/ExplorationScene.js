import React, {useRef} from "react";
import { Scene } from "react-three-fiber/components";
import {Regions} from "../../data/Regions";
import Background from "../Background";
import {Actions} from "../../data/Actions";
import {getGlobalState} from "../../engine";

export default function ExplorationScene(props) {
    const region = useRef(Regions[props.state.currentRegion]);

    return <Scene>
        <Background region={region.current} inactive={!Actions[getGlobalState().currentAction].animateBackground} />
    </Scene>
}