import PlayerStats from "../PlayerStats";
import TopSection from "../TopSection";
import {getCharacter, getGlobalState} from "../../engine";
import BottomSection from "../BottomSection";
import {config} from "../../config";
import EnemySidebar from "../EnemySidebar";
import {Canvas} from "react-three-fiber";
import React, {Suspense} from "react";
import GameScreen from "../GameScreen";

const styles = {
    root: {
        display: "flex",
        flex: "1",
        flexDirection: "row",
        justifyContent: "space-between"
    }
}

export default function AdventuringPage(props) {
    return <div className="App" style={styles.root}>
        <PlayerStats player={props.player}/>
        <div style={{display: "flex", flex: "1 0 auto", flexDirection: "column"}}>
            <TopSection character={getCharacter(0)}/>
            <BottomSection state={getGlobalState()} actionLog={props.actionLog}
                           nextActionName={props.nextAction}
                           currentAction={props.currentAction}
                           setNextAction={(newAction) => {
                               props.setNextAction(newAction);
                               getGlobalState().nextAction = newAction;
                           }}
                           actionTime={props.actionTime}
                           startManualSpeedup={props.startManualSpeedup}
                           stopManualSpeedup={props.stopManualSpeedup}
            />
        </div>
        <EnemySidebar currentEncounter={props.currentEncounter} actionLog={props.actionLog}/>
        <Canvas style={{position: "absolute", zIndex: -1}} gl={{antialias: false}}>
            <Suspense fallback={null}>
                <GameScreen scene={1} state={getGlobalState()}/>
            </Suspense>
        </Canvas>
    </div>
}