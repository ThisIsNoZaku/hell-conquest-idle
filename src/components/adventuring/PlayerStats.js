import Paper from "@material-ui/core/Paper";
import React, {useMemo} from "react";
import {MemoizedCharacterSheet as CharacterSheet} from "./CharacterSheet";
import calculateDamageBy from "../../engine/combat/calculateDamageBy";
import calculateAttackDowngradeCost from "../../engine/combat/calculateAttackDowngradeCost";
import calculateAttackUpgradeCost from "../../engine/combat/calculateAttackUpgradeCost";
import getPowerNeededForLevel from "../../engine/general/getPowerNeededForLevel";
import {Decimal} from "decimal.js";
import * as _ from "lodash";

const styles = {
    alive: {
        overflowY: "scroll",
        width: "25%",
        backgroundColor: "#eeeeee"
    },
    dead: {
        width: "25%",
        backgroundColor: "#b3827f",
        overflowY: "scroll",
    }
}

export default function PlayerStats(props) {
    const calculatedDamage = useMemo(() => calculateDamageBy(props.player).against(props.enemy), [
        props.player,
        props.enemy
    ]);
    const attackDowngradeCost = calculateAttackDowngradeCost(props.player, props.enemy);
    const attackUpgradeCost = calculateAttackUpgradeCost(props.player, props.enemy);
    const powerNeededForNextLevel = getPowerNeededForLevel(props.player.powerLevel.plus(1));
    const progressToNextLevel = Decimal(props.player.absorbedPower);
    const latentPowerModifier = useMemo(() => Decimal(props.player.latentPowerModifier.times(100).toFixed()), [
        props.player.latentPower
    ]);
    return <Paper style={!props.player || props.player.isAlive ? styles.alive : styles.dead}>
        <CharacterSheet
            appearance={_.get(props.player, "appearance")}
            characterPowerLevel={_.get(props.player, "powerLevel", Decimal(1)).toFixed()}
            characterAbsorbedPower={_.get(props.player, "absorbedPower", Decimal(1)).toFixed()}
            characterAdjectives={_.get(props.player, "adjectives", [])}
            latentPower={_.get(props.player, "latentPower", Decimal(1))}
            latentPowerCap={_.get(props.player, "latentPowerCap", Decimal(1)).toFixed()}
            latentPowerModifier={latentPowerModifier.toFixed()}
            powerNeededForNextLevel={powerNeededForNextLevel.toFixed()}
            progressToNextLevel={progressToNextLevel.toFixed()}
            characterHp={_.get(props.player, "hp", Decimal(1)).toFixed()}
            characterMaximumHp={_.get(props.player, "maximumHp", Decimal(1)).toFixed()}
            characterAttributes={_.get(props.player, "attributes")}
            characterTactics={_.get(props.player, "tactics")}
            characterTraits={_.get(props.player, "traits")}

            characterPower={_.get(props.player, "combat.power", Decimal(0)).toFixed()}
            characterResilience={_.get(props.player, "combat.resilience", Decimal(0)).toFixed()}
            characterEvasion={_.get(props.player, "combat.evasion", Decimal(0)).toFixed()}
            characterPrecision={_.get(props.player, "combat.precision", Decimal(0)).toFixed()}

            characterStamina={_.get(props.player, "combat.unmodifiedMaximumStamina", Decimal(0)).toFixed()}
            attackUpgradeCost={attackUpgradeCost}
            attackDowngradeCost={attackDowngradeCost}
            calculatedDamage={calculatedDamage}/>
    </Paper>
}