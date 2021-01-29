import calculateReactionCost from "./calculateReactionCost";
import {DefenseActions} from "../../../data/CombatActions";
import {Tactics} from "../../../data/Tactics";
import {debugMessage} from "../../../debugging";

export default function determineCharacterCombatReaction(attacker, attack, target, targetStartingEnergy) {
    debugMessage(`Determining reaction for '${target.id}'`)
    const actionCosts = Object.keys(DefenseActions).reduce((actions, next)=>{
        actions[next] = calculateReactionCost(attacker, next, target);
        return actions;
    }, {});
    const energyPercentage = targetStartingEnergy.div(target.combat.maximumStamina);
    debugMessage(`Energy percentage is ${energyPercentage}`);
    // TODO: At or over max stamina, use most powerful defense
    if((energyPercentage.gte(Tactics.defensive[target.tactics.defensive].energyFloor) || energyPercentage.gte(Tactics.defensive[target.tactics.defensive].energyCeiling)) && target.combat.stamina.gte(actionCosts[target.tactics.defensive])) {
        if(energyPercentage.gte(1)) {
            debugMessage("At/over energy cap, so dodging.");
            return "dodge";
        }
        debugMessage(`Using defense ${target.tactics.defensive}`);
        return target.tactics.defensive;
    }
    return "none";
}