import Grid from "@material-ui/core/Grid";
import React, {useContext, useMemo} from "react";
import {
    getGlobalState,
    getSpriteForCreature
} from "../../engine";
import {MemoizedCharacterAttributes as CharacterAttributes} from "./charactersheet/CharacterAttributes";
import CharacterTraits from "./charactersheet/CharacterTraits";
import Tooltip from "@material-ui/core/Tooltip";
import TacticsSection from "./charactersheet/TacticsSection";
import CharacterCombatStatistics from "./charactersheet/CharacterCombatStatistics";
import {Help} from "@material-ui/icons";
import RivalsComponent from "./charactersheet/RivalsComponent";
import {EnemyContext, PlayerContext} from "../scene/AdventuringPage";
import Paper from "@material-ui/core/Paper";

const styles = {
    alive: {
        flexShrink: 0,
        minHeight: "100%",
        overflowY: "auto",
        backgroundColor: "#eeeeee"
    },
    dead: {
        flexShrink: 0,
        minHeight: "100%",
        backgroundColor: "#b3827f",
        overflowY: "auto",
    }
}

export function CharacterSheet(props) {
    const character = useContext(props.isPc ? PlayerContext : EnemyContext);
    const spriteSrc = useMemo(() => character ? getSpriteForCreature(character.appearance) : null, [character && character.appearance]);

    return <Paper {...props} style={!character || character.isAlive ? styles.alive : styles.dead}>
        {character &&
        <Grid container>
            <Grid item xs={12}>
                <img src={spriteSrc} style={{height: "75px"}}/>
            </Grid>
            {<Grid item xs={12}>
                {character.name}
            </Grid>}
            <Grid item container>
                <Grid item xs>
                    Level
                </Grid>
                <Grid item xs>
                    {character.powerLevel.toFixed()}
                </Grid>
                <Grid item xs>
                    Inherited Power Bonus
                    <Tooltip
                        title="Inherited power increases damage, health and energy. Inherited power increases when you intimidate enemy demons or reincarnate and is soft-capped by the level of the strongest enemy you've defeated.">
                        <Help/>
                    </Tooltip>
                </Grid>
                <Grid item xs>
                    <div style={{color: character.latentPower.gte(character.latentPowerCap) ? "orange" : "inherit"}}>
                        {character.latentPowerModifier.times(100).toFixed()}%
                    </div>
                </Grid>
            </Grid>
            <Grid container>
                <Grid item container>
                    <Grid item xs>
                        <strong>Attributes</strong>
                    </Grid>
                </Grid>
                <CharacterAttributes
                    hp={character.hp.toFixed()}
                    maximumHp={character.maximumHp.toFixed()}
                    characterAttributes={character.attributes}
                />
            </Grid>
            <CharacterCombatStatistics isPc={props.isPc}/>
            <Grid container>
                <Grid item xs={12}>
                    <strong>Traits</strong>
                </Grid>
                <CharacterTraits isPc={props.isPc}/>
            </Grid>
            <TacticsSection isPc={props.isPc}/>
        </Grid>}
    </Paper>

}

export const MemoizedCharacterSheet = React.memo(CharacterSheet);