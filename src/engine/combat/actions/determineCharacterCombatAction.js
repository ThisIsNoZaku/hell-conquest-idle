import {Decimal} from "decimal.js";
import {getConfigurationValue} from "../../../config";
import calculateActionCost from "./calculateActionCost";
import calculateReactionCost from "./calculateReactionCost";

export default function determineCharacterCombatAction(actingCharacter, enemy) {
    const attackEnergyCosts = {
        small: calculateActionCost(actingCharacter, "simpleAttack", enemy),
        power: calculateActionCost(actingCharacter, "powerAttack", enemy),
        none: Decimal(0)
    }
    const defenseEnergyCosts = {
        none: Decimal(0),
        block: calculateReactionCost(actingCharacter, "block", enemy),
        dodge: calculateReactionCost(actingCharacter, "dodge", enemy)
    }
    switch (actingCharacter.tactics.offensive) {
        case "overwhelm":
            if(attackEnergyCosts.power.lte(actingCharacter.combat.stamina)) {
                return "powerAttack";
            } else {
                return "none"
            }
        case "attrit":
            if(attackEnergyCosts.small.lte(actingCharacter.combat.stamina)) {
                return "simpleAttack";
            } else {
                return "none"
            }
        case "counter":
            if(defenseEnergyCosts.dodge.gt(enemy.combat.stamina) && attackEnergyCosts.power.lte(actingCharacter.combat.stamina)) {
                return "powerAttack";
            } else {
                return "none";
            }
    }
}