import Paper from "@material-ui/core/Paper";
import React, {useCallback, useState} from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {CharacterSheet} from "./CharacterSheet";
import RivalsComponent from "./charactersheet/RivalsComponent";
import FactionsComponent from "./charactersheet/FactionsComponent";

export default function PlayerSidebar(props) {
    const [activeTab, setActiveTab] = useState(0);
    const changeActive = (event, value) => setActiveTab(value)
    return <Paper style={{width: "25%", flexShrink: 0}}>
        <Tabs
            value={activeTab}
            onChange={changeActive}
            variant="scrollable"
            // scrollButtons="on"
        >
            <Tab label="Character"/>
            <Tab label="Rivals"/>
            <Tab label="Factions"/>
        </Tabs>
        <div hidden={activeTab !== 0} style={{width: "100%"}}>
            <CharacterSheet isPc={true}/>
        </div>
        <div hidden={activeTab !== 1} style={{width: "100%"}}>
            <RivalsComponent/>
        </div>
        <div hidden={activeTab !== 2} style={{width: "100%"}}>
            <FactionsComponent/>
        </div>
    </Paper>
}