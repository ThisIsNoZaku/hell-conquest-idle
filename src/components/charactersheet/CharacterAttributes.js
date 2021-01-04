import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import {Help} from "@material-ui/icons";
import {config} from "../../config";
import React, {useMemo} from "react";
import { Attributes } from "../../data/Attributes";
import {Decimal} from "decimal.js";

export default function CharacterAttributes(props) {
    const currentHp = useMemo(() => props.character.currentHp, [
        props.character.currentHp
    ]);
    const maximumHp = useMemo(() => props.character.maximumHp, [
        props.character.maximumHp
    ]);
    const characterAttributes = useMemo(() => props.character.attributes, [
        props.character.attributes
    ]);
    return <React.Fragment>
        <Grid item container>
            <Grid item xs={6}>
                Health
            </Grid>
            <Grid item xs={5}>
                {currentHp.toFixed()} / {maximumHp.toFixed()}
            </Grid>
        </Grid>
        <Grid container direction="row">
            {Object.keys(Attributes).map(attribute => {
                return <Grid item xs>
                    <Tooltip title={Attributes[attribute].description({
                        rank: Decimal(characterAttributes[attribute]).toFixed()
                    })}>
                        <div style={{textAlign: "center"}}>
                            <img src={Attributes[attribute].icon}/>
                            <div>
                                <span style={{fontSize: "12"}}>{Attributes[attribute].label}</span>
                            </div>
                            <div>
                                {Decimal(characterAttributes[attribute]).toFixed()}
                            </div>
                        </div>
                    </Tooltip>
                </Grid>
            })}
        </Grid>

    </React.Fragment>
}