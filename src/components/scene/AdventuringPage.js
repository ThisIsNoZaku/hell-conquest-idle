import PlayerStats from "../PlayerStats";
import TopSection from "../TopSection";
import {getCharacter, getGlobalState} from "../../engine";
import BottomSection from "../BottomSection";
import EnemySidebar from "../EnemySidebar";
import React from "react";

const styles = {
    root: {
        display: "flex",
        flex: "1",
        flexDirection: "row",
        justifyContent: "space-between",
        overflow: "hidden"
    },
    image: {
        position: "absolute",
        height: "100%",
        left: 0
    },
    background: {
        position: "absolute",
        height: "100%",
        width: "100%",
        left: 0
    }
}

export default function AdventuringPage(props) {
    return <div className="App" style={styles.root}>
        <div id="background" style={{
            position: "absolute",
            zIndex: "-10",
            overflow: "hidden",
            height: "100vh",
            width: "100vw"
        }}>
            <img style={styles.background} src={"./backgrounds/parallax-demon-woods-bg.png"}/>
            <img style={styles.image} src={"./backgrounds/parallax-demon-woods-far-trees.png"}/>
            <img style={styles.image} src={"./backgrounds/parallax-demon-woods-mid-trees.png"}/>
            <img style={styles.image} src={"./backgrounds/parallax-demon-woods-close-trees.png"}/>
        </div>
        <PlayerStats player={props.player}/>
        <div style={{display: "flex", flex: "1 0 auto", flexDirection: "column"}}>
            <TopSection character={getCharacter(0)}/>
            <BottomSection state={getGlobalState()} actionLog={props.actionLog}
                           togglePause={props.togglePause}
                           paused={props.paused}
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

    </div>
}