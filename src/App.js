import './App.css';
import {v4} from "node-uuid";
import * as _ from "lodash";
import React, {useEffect, useRef, useState} from "react";
import 'react-circular-progressbar/dist/styles.css';
import {Regions} from "./data/Regions";
import {Actions} from "./data/Actions";
import {Decimal} from "decimal.js";
import {
    evaluateExpression,
    getCharacter,
    getGlobalState, getManualSpeedMultiplier,
    loadGlobalState, reincarnateAs,
    saveGlobalState, unpause
} from "./engine";
import * as seedrandom from "seedrandom";
import {config} from "./config";
import {MemoryRouter, Route, Switch} from "react-router-dom";
import ReincarnationSelectionPage from "./components/scene/ReincarnationSelectionPage";
import AdventuringPage from "./components/scene/AdventuringPage";
import DebugUi from "./components/DebugUi";
import {useHotkeys} from "react-hotkeys-hook";
import {debugMessage} from "./debugging";
import SplashPage from "./components/scene/SplashPage";
import {resolveCombat} from "./engine/combat";

loadGlobalState();

const rng = seedrandom();

function App() {
    const [debugUiEnabled, setDebugUiEnabled] = useState(false);

    useHotkeys("`", () => {
        setDebugUiEnabled(enabled => {
            if (config.debug) {
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
        <MemoryRouter initialEntries={[
            getGlobalState().currentAction === "reincarnating" ? "/reincarnating" : (
                getGlobalState().currentAction === "adventuring" ? "/adventuring" : "/")
        ]} basename="%PUBLIC_URL%">
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
        </MemoryRouter>
    );
}

export default App;