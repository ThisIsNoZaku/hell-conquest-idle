import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";

export default function TutorialDialog(props) {
    return <Dialog open={props.open} onClose={props.onClose}>
        <DialogTitle>{props.tutorial && props.tutorial.title}</DialogTitle>
        <DialogContent dangerouslySetInnerHTML={{
            __html: props.tutorial && props.tutorial.body
        }}></DialogContent>
        <Button variant="outlined" color="primary" onClick={props.close}>Done</Button>
    </Dialog>
}