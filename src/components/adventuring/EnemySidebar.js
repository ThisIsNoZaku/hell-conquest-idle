import React, {useMemo} from "react";
import Paper from "@material-ui/core/Paper";
import {MemoizedCharacterSheet as CharacterSheet} from "./CharacterSheet";
import calculateDamageBy from "../../engine/combat/calculateDamageBy";
import calculateAttackDowngradeCost from "../../engine/combat/calculateAttackDowngradeCost";
import calculateAttackUpgradeCost from "../../engine/combat/calculateAttackUpgradeCost";
import getPowerNeededForLevel from "../../engine/general/getPowerNeededForLevel";
import {Decimal} from "decimal.js";
import * as _ from "lodash";

const styles = {
    alive: {
        width: "25%",
        backgroundColor: "#eeeeee"
    },
    dead: {
        width: "25%",
        backgroundColor: "#b3827f"
    }
}

export default function EnemySidebar(props) {
    const calculatedDamage = useMemo(() => calculateDamageBy(props.enemy).against(props.player), [
        props.player,
        props.enemy
    ]);
    const attackDowngradeCost = calculateAttackDowngradeCost(props.enemy, props.player);
    const attackUpgradeCost = calculateAttackUpgradeCost(props.enemy, props.player);
    const powerNeededForNextLevel = getPowerNeededForLevel(Decimal(_.get(props.enemy, ["powerLevel"], 0)).plus(1));
    const progressToNextLevel = Decimal(_.get(props.enemy, "absorbedPower", 0));
    const latentPowerModifier = useMemo(() => Decimal(_.get(props.enemy, "latentPowerModifier", 0)).times(100), [
        _.get(props.enemy, "latentPower")
    ]);
    return <Paper style={!props.enemy || props.enemy.isAlive ? styles.alive : styles.dead}>
        {props.enemy && <CharacterSheet
            appearance={_.get(props.enemy, "appearance")}
            characterPowerLevel={_.get(props.enemy, "powerLevel", Decimal(1)).toFixed()}
            characterAbsorbedPower={_.get(props.enemy, "absorbedPower", Decimal(1)).toFixed()}
            characterAdjectives={_.get(props.enemy, "adjectives", [])}
            latentPower={_.get(props.enemy, "latentPower", Decimal(1))}
            latentPowerCap={_.get(props.enemy, "latentPowerCap", Decimal(1)).toFixed()}
            latentPowerModifier={latentPowerModifier.toFixed()}
            powerNeededForNextLevel={powerNeededForNextLevel.toFixed()}
            progressToNextLevel={progressToNextLevel.toFixed()}
            characterHp={_.get(props.enemy, "hp", Decimal(1)).toFixed()}
            characterMaximumHp={_.get(props.enemy, "maximumHp", Decimal(1)).toFixed()}
            characterAttributes={_.get(props.enemy, "attributes")}
            characterTactics={_.get(props.enemy, "tactics")}
            characterTraits={_.get(props.enemy, "traits")}

            characterPower={_.get(props.enemy, "combat.power", Decimal(0)).toFixed()}
            characterResilience={_.get(props.enemy, "combat.resilience", Decimal(0)).toFixed()}
            characterEvasion={_.get(props.enemy, "combat.evasion", Decimal(0)).toFixed()}
            characterPrecision={_.get(props.enemy, "combat.precision", Decimal(0)).toFixed()}

            attackUpgradeCost={attackUpgradeCost}
            attackDowngradeCost={attackDowngradeCost}
            calculatedDamage={calculatedDamage}/>}
    </Paper>
}