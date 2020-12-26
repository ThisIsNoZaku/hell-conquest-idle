import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import {Help} from "@material-ui/icons";
import {config} from "../../config";
import React from "react";

export default function CharacterAttributes(props) {
    return <React.Fragment>
        <Grid item container>
            <Grid item xs={6}>
                Health
            </Grid>
            <Grid item xs={5}>
                {props.character.currentHp.toFixed()} / {props.character.maximumHp.toFixed()}
            </Grid>
            <Grid item xs={1}>
                <Tooltip
                    title={
                        <span>Health is how much damage needed to destroy you. If you die, you forcibly reincarnate.</span>}>
                    <Help/>
                </Tooltip>
            </Grid>
        </Grid>
        <Grid item container>
            <Grid item xs={6}>
                {config.attributes.brutality.label}
            </Grid>
            <Grid item xs={5} title={``}>
                {props.character.attributes.brutality.toFixed()}
            </Grid>
            <Grid item xs={1}>
                <Tooltip
                    title={<span
                        dangerouslySetInnerHTML={{__html: config.attributes.brutality.description(
                                {
                                    rank: props.character.attributes.brutality.toNumber()
                                }
                            )}}></span>}>
                    <Help/>
                </Tooltip>
            </Grid>
        </Grid>
        <Grid item container>
            <Grid item xs={6}>
                {config.attributes.cunning.label}
            </Grid>
            <Grid item xs={5}>
                {props.character.attributes.cunning.toFixed()}
            </Grid>
            <Grid item xs={1}>
                <Tooltip
                    title={
                        <span
                            dangerouslySetInnerHTML={{__html: config.attributes.cunning.description(
                                    {
                                        rank: props.character.attributes.cunning.toNumber()
                                    }
                                )}}></span>
                    }>
                    <Help/>
                </Tooltip>
            </Grid>
        </Grid>
        <Grid item container>
            <Grid item xs={6}>
                {config.attributes.deceit.label}
            </Grid>
            <Grid item xs={5}>
                {props.character.attributes.deceit.toFixed()}
            </Grid>
            <Grid item xs={1}>
                <Tooltip
                    title={
                        <span
                            dangerouslySetInnerHTML={{__html: config.attributes.deceit.description(
                                    {
                                        rank: props.character.attributes.deceit.toNumber()
                                    }
                                )}}>
                            </span>}>
                    <Help/>
                </Tooltip>
            </Grid>
        </Grid>
        <Grid item container>
            <Grid item xs={6}>
                {config.attributes.madness.label}
            </Grid>
            <Grid item xs={5}>
                {props.character.attributes.madness.toFixed()}
            </Grid>
            <Grid item xs={1}>
                <Tooltip
                    title={<span
                        dangerouslySetInnerHTML={{__html: config.attributes.madness.description(
                                {
                                    rank: props.character.attributes.madness.toNumber()
                                }
                            )}}/>}>
                    <Help/>
                </Tooltip>
            </Grid>
        </Grid>
    </React.Fragment>
}