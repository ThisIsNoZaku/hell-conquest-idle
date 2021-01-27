import {Decimal} from "decimal.js";
import {getConfigurationValue} from "../../../config";

export default function determineCharacterCombatAction(actingCharacter, enemy) {
    const attackEnergyCosts = {
        small: enemy.powerLevel.times(getConfigurationValue("attack_upgrade_cost_per_enemy_level")).floor(),
        power: enemy.powerLevel.times(getConfigurationValue("attack_upgrade_cost_per_enemy_level")).times(1.5).floor(),
        none: Decimal(0)
    }
    const defenseEnergyCosts = {
        none: Decimal(0),
        block: actingCharacter.powerLevel.times(getConfigurationValue("attack_downgrade_cost_per_enemy_level")),
        dodge: actingCharacter.powerLevel.times(getConfigurationValue("attack_downgrade_cost_per_enemy_level")).times(2)
    }
    switch (actingCharacter.tactics.offensive) {
        case "overwhelm":
            if(attackEnergyCosts.power.lte(actingCharacter.combat.stamina)) {
                return "power-attack";
            } else {
                return "none"
            }
        case "attrit":
            if(attackEnergyCosts.small.lte(actingCharacter.combat.stamina)) {
                return "small-attack";
            } else {
                return "none"
            }
        case "counter":
            if(defenseEnergyCosts.dodge.gt(enemy.combat.stamina)) {
                return "power-attack";
            } else {
                return "none";
            }
    }
}