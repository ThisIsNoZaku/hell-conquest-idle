import Tooltip from "@material-ui/core/Tooltip";
import {Traits} from "../../../data/Traits";
import React from "react";
import {Decimal} from "decimal.js";

export default function CharacterTraits(props) {
    return <React.Fragment>
        {Object.keys(props.character.traits).map(trait => <Tooltip key={trait} title={
            <React.Fragment>
                <span>{Traits[trait].name} {Decimal(props.character.traits[trait]).toFixed()}:</span>
            <span dangerouslySetInnerHTML={{
                __html: Traits[trait].description({
                    tier: Decimal(props.character.traits[trait])
                })
            }}></span>
            </React.Fragment>}>
            <img src={Traits[trait].icon}></img>
        </Tooltip>)
        }
    </React.Fragment>

}