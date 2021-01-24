import Tooltip from "@material-ui/core/Tooltip";
import {Traits} from "../../../data/Traits";
import React from "react";
import {Decimal} from "decimal.js";

export default function CharacterTraits(props) {
    return <React.Fragment>
        {Object.keys(props.characterTraits).map(trait => <Tooltip key={trait} title={
            <React.Fragment>
                <span>{Traits[trait].name} {Decimal(props.characterTraits[trait]).toFixed()}: </span>
            <span dangerouslySetInnerHTML={{
                __html: Traits[trait].description({
                    tier: Decimal(props.characterTraits[trait])
                })
            }}></span>
            </React.Fragment>}>
            <img src={Traits[trait].icon}></img>
        </Tooltip>)
        }
    </React.Fragment>

}