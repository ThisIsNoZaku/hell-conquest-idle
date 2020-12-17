import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import {Help} from "@material-ui/icons";
import React from "react";
import {getPowerNeededForLevel, getSpriteForCreature} from "../engine";
import {Traits} from "../data/Traits";
import {config} from "../config";

const styles = {
    tooltip: {
        fontSize: "12pt"
    }
}

export default function CharacterSheet(props) {
    return <Grid container>
        <Grid item xs={12}>
            <img src={getSpriteForCreature(props.character.appearance)} style={{height: "75px"}}/>
        </Grid>
        <Grid item container>
            <Grid item xs={6}>
                Level
            </Grid>
            <Grid item xs={6}>
                {props.character.powerLevel.toFixed()}
            </Grid>
        </Grid>
        {props.character.absorbedPower !== undefined && <Grid item xs={12}>
            <progress
                value={props.character.absorbedPower.minus(getPowerNeededForLevel(props.character.powerLevel)).div(getPowerNeededForLevel(props.character.powerLevel.plus(1))).mul(100).toNumber()}
                max={100}
                title={`${props.character.absorbedPower.toFixed()}/${getPowerNeededForLevel(props.character.powerLevel.plus(1)).toFixed()}`}
            ></progress>
        </Grid>}
        <Grid container>
            <Grid item container>
                <Grid item xs>
                    <strong>Combat Attributes</strong>
                </Grid>
            </Grid>
            <Grid item container>
                <Grid item xs={6}>
                    Health
                </Grid>
                <Grid item xs={5}>
                    {props.character.currentHp.toFixed()} / {props.character.maximumHp.toFixed()}
                </Grid>
                <Grid item xs={1}>
                    <Tooltip
                        title={<span>Health is how much damage needed to destroy you. If you die, you forcibly reincarnate.</span>}>
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
                            dangerouslySetInnerHTML={{__html: ``}}></span>}>
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
                                dangerouslySetInnerHTML={{__html: ``}}></span>
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
                                dangerouslySetInnerHTML={{__html: ``}}>
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
                            dangerouslySetInnerHTML={{__html: ''}}/>}>
                        <Help/>
                    </Tooltip>
                </Grid>
            </Grid>
        </Grid>
        <Grid container>
            <Grid item xs={12}>
                <strong>Derived</strong>
            </Grid>
            <Grid container>
                <Grid item xs={6}>
                    Min. Damage
                </Grid>
                <Grid item xs={6}>
                    {props.character.combat.minimumDamage.toFixed()}
                </Grid>
            </Grid>
            <Grid container>
                <Grid item xs={6}>
                    Med. Damage
                </Grid>
                <Grid item xs={6}>
                    {props.character.combat.medianDamage.toFixed()}
                </Grid>
            </Grid>
            <Grid container>
                <Grid item xs={6}>
                    Max. Damage
                </Grid>
                <Grid item xs={6}>
                    {props.character.combat.maximumDamage.toFixed()}
                </Grid>
            </Grid>
        </Grid>
        <Grid container>
            <Grid item xs={12}>
                <strong>Traits</strong>
            </Grid>
            {
                Object.keys(props.character.traits).map(trait => <Tooltip title={
                    <span dangerouslySetInnerHTML={{
                        __html: Traits[trait].description({
                            rank: props.character.traits[trait]
                        })
                    }}></span>}>
                    <img src={Traits[trait].icon}></img>
                </Tooltip>)
            }
        </Grid>
        {config.artifacts.enabled && <Grid container>
            <Grid item xs={12}>
                <strong>Artifacts</strong>
            </Grid>
            <Grid>
                {
                    JSON.stringify(props.character.items)
                }
            </Grid>
        </Grid>}
    </Grid>

}