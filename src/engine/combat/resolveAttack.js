import Decimal from "decimal.js";
import {Tactics} from "../../data/Tactics";
import {generateAttackEvent, generateDamageEvent, generateHitEvents} from "../events/generate";
import {getConfigurationValue} from "../../config";
import {HitTypes} from "../../data/HitTypes";
import calculateDamageBy from "./calculateDamageBy";
import {debugMessage} from "../../debugging";
import calculateAttackUpgradeCost from "./calculateAttackUpgradeCost";
import calculateAttackDowngradeCost from "./calculateAttackDowngradeCost";
import attackerWillUpgrade from "./attackerWillUpgrade";
import defenderWillDowngrade from "./defenderWillDowngrade";
import calculateActionCost from "./actions/calculateActionCost";
import calculateReactionCost from "./actions/calculateReactionCost";
import {AttackActions, DefenseActions} from "../../data/CombatActions";
import * as _ from "lodash";

export default function resolveAttack(actingCharacter, action, targetedCharacter, reaction, tick) {
    if (typeof tick !== "number") {
        throw new Error("Tick not a number");
    }
    // Attacker spends energy to perform attack
    let hitLevel = 0;
    const actionEnergyCost = calculateActionCost(actingCharacter, action, targetedCharacter);
    if(actionEnergyCost.lte(actingCharacter.combat.stamina)) {
        actingCharacter.combat.stamina = actingCharacter.combat.stamina.minus(actionEnergyCost);
        hitLevel = AttackActions[action.primary].hitLevel;
    } else {
        action = "none";
    }

    const reactionEnergyCost = calculateReactionCost(targetedCharacter, reaction, actingCharacter);
    if(reactionEnergyCost.lte(targetedCharacter.combat.stamina)) {
        targetedCharacter.combat.stamina = targetedCharacter.combat.stamina.minus(reactionEnergyCost);
        hitLevel = Math.max(HitTypes.min, hitLevel + DefenseActions[reaction.primary].hitLevelModifier);
    } else {
        reaction = "none";
    }
    if(hitLevel === HitTypes.min) {
        return {
            attack: generateAttackEvent(hitLevel, actingCharacter, targetedCharacter, false, action, actionEnergyCost, reaction, reactionEnergyCost)
        };
    }
    const baseDamage = calculateDamageBy(actingCharacter).using(action)
        .against(targetedCharacter).using(reaction)[hitLevel];
    const damageDone = baseDamage;
    targetedCharacter.hp = Decimal.max(0, targetedCharacter.hp.minus(damageDone));
    return generateHitEvents(hitLevel, actingCharacter, targetedCharacter, damageDone, "physical", action, actionEnergyCost, reaction, reactionEnergyCost);
}