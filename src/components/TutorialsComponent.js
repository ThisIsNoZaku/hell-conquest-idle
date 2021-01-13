import TutorialDialog from "./TutorialDialog";
import React, {useEffect, useState} from "react";
import {completeTutorial, enableTutorial, subscribeToTutorials, unsubscribeFromTutorials} from "../engine/tutorials";
import { useLocation } from "react-router-dom";
import {Tutorials} from "../data/Tutorials";

export default function TutorialsComponent(props) {
    const [activeTutorial, setActiveTutorial] = useState();
    const location = useLocation();
    useEffect(() => {
        const listener = (status, id, tutorial) => {
            if(status === "completed") {
                setActiveTutorial();
            } else {
                setActiveTutorial(id);
            }
        };
        subscribeToTutorials(listener);
        enableTutorial("intro");
        return () => unsubscribeFromTutorials(listener);
    });
    return <TutorialDialog
        open={location.pathname !== "/" && activeTutorial !== undefined}
        close={() => {
            completeTutorial(activeTutorial)
        }}
        tutorial={Tutorials[activeTutorial]}/>
}