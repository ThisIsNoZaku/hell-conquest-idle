import Paper from "@material-ui/core/Paper";
import React from "react";
import Grid from "@material-ui/core/Grid";

const styles = {
    history: {
        height: "15%",
        flexDirection: "column",
        overflowY: "scroll"
    },
    item: {
        width: "100%",
        textAlign: "center"
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
    return <Grid container direction="row-reverse" key={item.uuid} style={styles.item} >
        <Grid item xs={12}>
            <Paper elevation={3}>
                <span dangerouslySetInnerHTML={{
                    __html: item.message
                }}></span>
            </Paper>
        </Grid>
    </Grid>
}