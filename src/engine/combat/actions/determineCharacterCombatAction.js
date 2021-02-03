import {Decimal} from "decimal.js";
import calculateActionCost from "./calculateActionCost";
import calculateReactionCost from "./calculateReactionCost";
import {Tactics} from "../../../data/Tactics";
import {debugMessage} from "../../../debugging";

export default function determineCharacterCombatAction(actingCharacter, actorStartingEnergy, enemy) {
    debugMessage(`Determining action for '${actingCharacter.id}'`)
    const defenseEnergyCosts = {
        none: Decimal(0),
        block: calculateReactionCost(actingCharacter, {primary: "block", enhancements: enemy.defenseEnhancements}, enemy),
        dodge: calculateReactionCost(actingCharacter, {primary: "dodge", enhancements: enemy.defenseEnhancements}, enemy)
    }
    // TODO: Over energy ceiling, use most powerful attack
    const energyPercentage = actorStartingEnergy.div(actingCharacter.combat.maximumStamina);
    debugMessage(`${actingCharacter.id} has an energy percentage of ${energyPercentage}`);
    if(energyPercentage.gte(1)) {
        return {
            primary: "powerAttack",
            enhancements: actingCharacter.attackEnhancements
        };
    }
    const primaryAction = Tactics.offensive[actingCharacter.tactics.offensive].actions.reduce((chosen, next)=>{
        if(chosen) {
            return chosen;
        }
        const actionCost = calculateActionCost(actingCharacter, {primary:next, enhancements: actingCharacter.attackEnhancements}, enemy);
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
        debugMessage(`Above energy floor? ${energyPercentAboveFloor}. Can afford action? ${canAffordAction}.`);
        return chosen;
    }, null) || "none";
    return {
        primary: primaryAction,
        enhancements: actingCharacter.attackEnhancements
    }
}