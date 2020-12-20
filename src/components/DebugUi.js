import Paper from "@material-ui/core/Paper";
import React, {useState} from "react";
import Grid from "@material-ui/core/Grid";
import {Creatures} from "../data/creatures";
import Button from "@material-ui/core/Button";
import {getGlobalState} from "../engine";
import * as _ from "lodash";

const styles = {
    root: {
        position: "fixed",
        width: "100vw",
        height: "100vh",
        bottom: 0,
        right: 0
    }
}

export default function DebugUi(props) {
    const [creatures, setCreatures] = useState(_.get(getGlobalState(), "creatures"));
    return <Paper style={styles.root} disabled={true}>
        <Grid container>
            <Grid item xs={12} style={{textAlign: "center"}}>
                <h3>Debug Menu</h3>
            </Grid>
            <Grid item xs={12}>
                <h3>Creatures</h3>
            </Grid>
            <Grid container item xs={12}>
                {Object.keys(Creatures).map(id => {
                    const enabled = _.get(creatures, [id, "enabled"]) !== false;
                    return <Grid item xs={12}>
                        <Button variant="contained" color={enabled ? "default" : "secondary"}
                                onClick={() => {
                                    _.set(getGlobalState(), ["creatures", id, "enabled"], !enabled);
                                    setCreatures({...creatures, [id]: {enabled: !enabled}})
                                } }
                        >
                            <img src={`/monsters/${Creatures[id].texture}`}/>
                            { Creatures[id].name }
                        </Button>
                    </Grid>
                })}

            </Grid>
        </Grid>
    </Paper>
}