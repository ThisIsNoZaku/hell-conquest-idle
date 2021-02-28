import Paper from "@material-ui/core/Paper";
import React, {useState} from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {CharacterSheet} from "./CharacterSheet";
import RivalsComponent from "./charactersheet/RivalsComponent";
import FactionsComponent from "./charactersheet/FactionsComponent";

export default function PlayerSidebar(props) {
    const [activeTab, setActiveTab] = useState(0);
    const changeActive = (event, value) => setActiveTab(value)
    return <Paper style={{width: "25%", flexShrink: 0, minHeight: "100%", overflowY: "auto"}}>
        <Tabs
            value={activeTab}
            onChange={changeActive}
            variant="scrollable"
        >
            <Tab label="Character"/>
            <Tab label="Rivals"/>
            <Tab label="Factions"/>
        </Tabs>
        <CharacterSheet isPc={true} hidden={activeTab !== 0}/>
        <RivalsComponent hidden={activeTab !== 1}/>
        <FactionsComponent hidden={activeTab !== 2}/>
    </Paper>
}