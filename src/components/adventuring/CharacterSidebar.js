import Paper from "@material-ui/core/Paper";
import React, {useMemo} from "react";
import {MemoizedCharacterSheet as CharacterSheet} from "./CharacterSheet";
import calculateDamageBy from "../../engine/combat/calculateDamageBy";
import getPowerNeededForLevel from "../../engine/general/getPowerNeededForLevel";
import {Decimal} from "decimal.js";
import * as _ from "lodash";
import {HitTypes} from "../../data/HitTypes";
import {calculateActionCost} from "../../engine/combat/actions/calculateActionCost";
import {getGlobalState} from "../../engine";

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

export function CharacterSidebar(props) {
    const character = _.get(props, "player", {});
    const enemy = _.get(props, "enemy", {});
    const powerNeededForNextLevel = getPowerNeededForLevel(Decimal(_.get(character, "powerLevel", 0)).plus(1));
    const progressToNextLevel = Decimal(_.get(character, "absorbedPower", 0));
    const latentPowerModifier = useMemo(() => Decimal(_.get(character, "latentPowerModifier", 0)).times(100).toFixed(), [
        _.get(character, "latentPower")
    ]);
    const blockCost = calculateActionCost(character, {primary: "block", enhancements: _.get(character, "defenseEnhancements", [])}, enemy).toFixed();
    const blockEffect = Decimal(HitTypes[-1].damageMultiplier).plus(_.get(character, "attackEnhancements", []).reduce((total, enhance)=>{
        return total + (enhance.additional_block_damage_reduction || 0);
    }, 0)).times(100).toFixed();
    const dodgeCost = calculateActionCost(character, {primary: "dodge", enhancements: _.get(character, "defenseEnhancements", [])}, enemy).toFixed();

    const basicAttackCost = calculateActionCost(character, {primary: "basicAttack", enhancements: _.get(character, "attackEnhancements", [])}, enemy).toFixed();
    const basicAttackDamage = calculateDamageBy(character).using({primary: "basicAttack", enhancements: _.get(character, "attackEnhancements", [])})
        .against(enemy).using({primary: "none", enhancements: _.get(enemy, ["defenseEnhancements"], [])})[0].toFixed();

    const powerAttackCost = calculateActionCost(character, {primary: "powerAttack", enhancements: _.get(character, "attackEnhancements", [])}, enemy).toFixed();
    const powerAttackDamage = calculateDamageBy(character).using({primary: "powerAttack", enhancements: _.get(character, "attackEnhancements", [])})
        .against(enemy).using({primary: "none", enhancements: _.get(enemy, ["defenseEnhancements"], [])})[1].toFixed();

    return <Paper style={!character || character.isAlive ? styles.alive : styles.dead}>
        {props.player && <CharacterSheet
            appearance={_.get(character, "appearance")}
            characterName={_.get(character, "name")}
            characterPowerLevel={_.get(character, "powerLevel", Decimal(1)).toFixed()}
            characterAbsorbedPower={_.get(character, "absorbedPower", Decimal(1)).toFixed()}
            characterAdjectives={_.get(character, "adjectives", [])}
            latentPower={_.get(character, "latentPower", Decimal(1))}
            latentPowerCap={_.get(character, "latentPowerCap", Decimal(1)).toFixed()}
            latentPowerModifier={latentPowerModifier}
            powerNeededForNextLevel={powerNeededForNextLevel.toFixed()}
            progressToNextLevel={progressToNextLevel.toFixed()}
            characterHp={_.get(character, "hp", Decimal(1)).toFixed()}
            characterMaximumHp={_.get(character, "maximumHp", Decimal(1)).toFixed()}
            characterAttributes={_.get(character, "attributes")}
            characterTactics={_.get(character, "tactics")}
            characterTraits={_.get(character, "traits")}

            characterEnergyGeneration={_.get(character, "energyGeneration")}

            characterPower={_.get(character, "combat.power", Decimal(0)).toFixed()}
            characterResilience={_.get(character, "combat.resilience", Decimal(0)).toFixed()}
            characterEvasion={_.get(character, "combat.evasion", Decimal(0)).toFixed()}
            characterPrecision={_.get(character, "combat.precision", Decimal(0)).toFixed()}

            characterStamina={_.get(character, "combat.unmodifiedMaximumStamina", Decimal(0)).toFixed()}

            blockCost={blockCost}
            blockEffect={blockEffect}
            dodgeCost={dodgeCost}

            basicAttackCost={basicAttackCost}
            basicAttackDamage={basicAttackDamage}
            powerAttackCost={powerAttackCost}
            powerAttackDamage={powerAttackDamage}

            enemyPower={_.get(enemy, "combat.power", Decimal(0)).toFixed()}
            enemyResilience={_.get(enemy, "combat.resilience", Decimal(0)).toFixed()}
            isPc={_.get(character, "isPc")}
            rivals={getGlobalState().rivals}

            attackEnhancements={_.get(character, "attackEnhancements", [])}
            defenseEnhancements={_.get(character, "defenseEnhancements", [])}
            />}
    </Paper>
}

export const MemoizedCharacterSidebar = React.memo(CharacterSidebar, () => false);