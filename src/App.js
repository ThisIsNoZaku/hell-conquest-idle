import './App.css';
import {v4} from "node-uuid";
import * as _ from "lodash";
import React, {useEffect, useRef, useState} from "react";
import 'react-circular-progressbar/dist/styles.css';
import {
    getGlobalState,
    loadGlobalState, reincarnateAs,
    saveGlobalState, unpause
} from "./engine";
import * as seedrandom from "seedrandom";
import {config, getConfigurationValue} from "./config";
import {MemoryRouter, Route, Switch} from "react-router-dom";
import ReincarnationSelectionPage from "./components/scene/ReincarnationSelectionPage";
import AdventuringPage from "./components/scene/AdventuringPage";
import DebugUi from "./components/DebugUi";
import {useHotkeys} from "react-hotkeys-hook";
import SplashPage from "./components/scene/SplashPage";
import TutorialsComponent from "./components/TutorialsComponent"

loadGlobalState();

const rng = seedrandom();

function App() {
    const [debugUiEnabled, setDebugUiEnabled] = useState(false);
    const [activeTutorial, setActiveTutorial] = useState(Object.values(getGlobalState().tutorials).find(t => t.enabled && !t.completed));

    useHotkeys("`", () => {
        setDebugUiEnabled(enabled => {
            if (getConfigurationValue("debug")) {
                if (!enabled) {
                    getGlobalState().paused = true;
                }
                saveGlobalState();
                return !enabled
            } else {
                return false;
            }
        });
    });

    return (
        <MemoryRouter basename="%PUBLIC_URL%">
            <Switch>
                <Route path="/" exact>
                    <SplashPage/>
                </Route>
                <Route path="/reincarnating" exact>
                    <ReincarnationSelectionPage reincarnate={(monster, attributes) => {
                        reincarnateAs(monster, attributes);
                        getGlobalState().automaticReincarnate = false;
                        unpause();
                    }}/>
                </Route>
                <Route path="/adventuring" exact>
                    <AdventuringPage
                        rng={rng}
                    />
                </Route>
            </Switch>
            {debugUiEnabled && <DebugUi/>}
            <TutorialsComponent/>
        </MemoryRouter>
    );
}

export default App;