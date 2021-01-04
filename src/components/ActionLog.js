import Paper from "@material-ui/core/Paper";
import React from "react";
import Grid from "@material-ui/core/Grid";

const styles = {
    history: {
        height: "15%",
        flexDirection: "column",
        overflowY: "scroll"
    }
}
export default function (props) {
    return <Paper style={styles.history}>
        {
            props.actionLog.map(item => printActionItem(item))
        }
    </Paper>
}


function printActionItem(item) {
    return <Grid container direction="row-reverse" key={item.uuid} style={{textAlign: "center"}}>
        <Grid item xs={11}>
                <span dangerouslySetInnerHTML={{
                    __html: item.message
                }}></span>
        </Grid>
        {item.tick && <Grid item={1}>{item.tick}: </Grid>}
    </Grid>
}