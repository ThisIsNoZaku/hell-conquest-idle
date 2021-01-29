import {Decimal} from "decimal.js";
import calculateActionCost from "./calculateActionCost";
import calculateReactionCost from "./calculateReactionCost";
import {Tactics} from "../../../data/Tactics";
import {debugMessage} from "../../../debugging";

export default function determineCharacterCombatAction(actingCharacter, actorStartingEnergy, enemy) {
    debugMessage(`Determining action for '${actingCharacter.id}'`)
    const defenseEnergyCosts = {
        none: Decimal(0),
        block: calculateReactionCost(actingCharacter, "block", enemy),
        dodge: calculateReactionCost(actingCharacter, "dodge", enemy)
    }
    // TODO: Over energy ceiling, use most powerful attack
    const energyPercentage = actorStartingEnergy.div(actingCharacter.combat.maximumStamina);
    return actingCharacter.attacks.reduce((chosen, next)=>{
        if(chosen) {
            return chosen;
        }
        const actionCost = calculateActionCost(actingCharacter, next, enemy);
        const canAffordAction = actionCost.lte(actingCharacter.combat.stamina);
        const energyPercentAboveFloor = energyPercentage.gte(Tactics.offensive[actingCharacter.tactics.offensive].energyFloor);
        const belowEnergyFloor = energyPercentage.gte(Tactics.offensive[actingCharacter.tactics.offensive].energyCeiling);
        if(canAffordAction && energyPercentAboveFloor) {
            if(actingCharacter.tactics.offensive === "counter" && belowEnergyFloor) {
                debugMessage()
                if(defenseEnergyCosts.dodge.gt(enemy.combat.stamina) || (energyPercentage.gte(Tactics.offensive[actingCharacter.tactics.offensive].energyCeiling) && next === "basicAttack")) {
                    debugMessage(`Enemy can dodge? ${defenseEnergyCosts.dodge.gt(enemy.combat.stamina)}. Energy percentage >= ceiling? ${energyPercentage.gte(Tactics.offensive[actingCharacter.tactics.offensive].energyCeiling)}.`);
                    return next;
                }
            } else {
                return next;
            }
        }
        return chosen;
    }, null) || "none";
}