import {getGlobalState} from "../../../engine";
import React, {useCallback, useState} from "react";
import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import {Traits} from "../../../data/Traits";
import {Decimal} from "decimal.js";
import {Tactics} from "../../../data/Tactics";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import {Help} from "@material-ui/icons";
import Paper from "@material-ui/core/Paper";


function changeRivalTactics(event) {
    const level = event.currentTarget.dataset.level;
    const tacticType = event.currentTarget.dataset.tacticType;
    const tactic = event.currentTarget.dataset.tactic;
    getGlobalState().rivals[level].tactics[tacticType] = tactic;
    return getGlobalState().rivals;
}

export default function RivalsComponent(props) {
    const [expanded, setExpanded] = useState(false);
    const [rivals, setRivals] = useState(getGlobalState().rivals);
    return <Paper {...props}>
        <Grid container>
            <Grid item xs={12} onClick={() => setExpanded(!expanded)}>
                <Button>
                    <strong>Your Rivals!</strong>
                    <Tooltip
                        title="These are the demons who have defeated you before and who you will encounter again at each level. Click here to change your tactics against each rival.">
                        <Help/>
                    </Tooltip>
                </Button>
            </Grid>
            {Object.keys(rivals || {}).map(level => {
                const rivalTactics = rivals[level].tactics;
                const rival = rivals[level].character;
                return <Grid container>
                    <Grid item xs={6}>
                        {level}
                    </Grid>
                    <Grid item xs={6}>
                        {rival.name} {Object.keys(rival.traits).map(traitId => {
                        return <Tooltip
                            title={Traits[traitId].name + " - tier " + Decimal(rival.traits[traitId]).toFixed()}>
                            <img src={Traits[traitId].icon}/>
                        </Tooltip>
                    })}
                    </Grid>
                    <Collapse in={expanded}>
                        <Grid container spacing={2}>
                            <Grid item container xs={12}>
                                {Object.keys(Tactics.offensive).map(tactic => {
                                    return <Grid item xs={12} xl={4}>
                                        <Button variant="contained"
                                                color={rivalTactics.offensive === tactic ? "primary" : "none"}
                                                style={{fontSize: "9px"}}
                                                onClick={e => {
                                                    setRivals({...changeRivalTactics(e)});
                                                }} data-tactic={tactic} data-level={level}
                                                data-tactic-type="offensive"
                                        >
                                            {Tactics.offensive[tactic].title}
                                        </Button>
                                    </Grid>
                                })}
                            </Grid>
                            <Grid item container xs={12}>
                                {Object.keys(Tactics.defensive).map(tactic => {
                                    return <Grid item xs={12} xl={4}>
                                        <Button variant="contained"
                                                color={rivalTactics.defensive === tactic ? "primary" : "none"}
                                                style={{fontSize: "9px"}}
                                                onClick={e => {
                                                    setRivals({...changeRivalTactics(e)});
                                                }} data-tactic={tactic} data-level={level}
                                                data-tactic-type="defensive"
                                        >
                                            {Tactics.defensive[tactic].title}
                                        </Button>
                                    </Grid>
                                })}
                            </Grid>
                        </Grid>
                    </Collapse>
                </Grid>
            })}
        </Grid>
    </Paper>
}