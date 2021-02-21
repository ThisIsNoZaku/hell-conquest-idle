import Tooltip from "@material-ui/core/Tooltip";
import {Traits} from "../../../data/Traits";
import React, {useContext, useReducer} from "react";
import {Decimal} from "decimal.js";
import {EnemyContext, PlayerContext} from "../../scene/AdventuringPage";

export default function CharacterTraits(props) {
    const character = useContext(props.isPc ? PlayerContext : EnemyContext);

    return <React.Fragment>
        {Object.keys(character.allTraits).map(trait => <Tooltip key={trait} title={
            <React.Fragment>
                <span>{Traits[trait].name} {Decimal(character.allTraits[trait]).toFixed()}: </span>
            <span dangerouslySetInnerHTML={{
                __html: Traits[trait].description({
                    tier: Decimal(character.allTraits[trait])
                })
            }}></span>
            </React.Fragment>}>
            <img src={Traits[trait].icon}></img>
        </Tooltip>)
        }
    </React.Fragment>
}