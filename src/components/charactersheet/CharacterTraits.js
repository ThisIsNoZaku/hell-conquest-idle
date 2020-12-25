import Tooltip from "@material-ui/core/Tooltip";
import {Traits} from "../../data/Traits";
import React from "react";

export default function CharacterTraits(props) {
    return <React.Fragment>
        {Object.keys(props.character.traits).map(trait => <Tooltip title={
            <span dangerouslySetInnerHTML={{
                __html: Traits[trait].description({
                    rank: props.character.traits[trait]
                })
            }}></span>}>
            <img src={Traits[trait].icon}></img>
        </Tooltip>)
        }
    </React.Fragment>
}