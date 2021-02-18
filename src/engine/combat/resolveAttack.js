import Decimal from "decimal.js";
import {generateAttackEvent, generateHitEvents, generateKillEvent} from "../events/generate";
import {HitTypes} from "../../data/HitTypes";
import calculateDamageBy from "./calculateDamageBy";
import {calculateActionCost} from "./actions/calculateActionCost";
import {CombatActions} from "../../data/CombatActions";
import triggerEvent from "../general/triggerEvent";
import onTakingDamage from "./events/onTakingDamage";
import {ActionEnhancements} from "../../data/ActionEnhancements";
import * as _ from "lodash";

export default function resolveAttack(actingCharacter, action, targetedCharacter, reaction, roundEvents, tick) {
    if (typeof tick !== "number") {
        throw new Error("Tick not a number");
    }
    // Attacker spends energy to perform attack
    let hitLevel = 0;
    let actionEnergyCost = calculateActionCost(actingCharacter, action, targetedCharacter);
    if(actionEnergyCost.lte(actingCharacter.combat.stamina)) {
        actingCharacter.combat.stamina = actingCharacter.combat.stamina.minus(actionEnergyCost);
        hitLevel = CombatActions[action.primary].hitLevel;
    } else {
        action = {primary: "none", enhancements: []};
        hitLevel = HitTypes.min;
        actionEnergyCost = Decimal(0);
    }

    let reactionEnergyCost = calculateActionCost(actingCharacter, reaction, targetedCharacter);
    if(reactionEnergyCost.lte(targetedCharacter.combat.stamina)) {
        targetedCharacter.combat.stamina = targetedCharacter.combat.stamina.minus(reactionEnergyCost);
        hitLevel = Math.max(HitTypes.min, hitLevel + CombatActions[reaction.primary].hitLevelModifier);
    } else {
        reaction = {primary: "none", enhancements: []};
        reactionEnergyCost = Decimal(0);
    }
    if(hitLevel === HitTypes.min) {
        const attackEvent = generateAttackEvent(hitLevel, actingCharacter, targetedCharacter, false, action, actionEnergyCost, reaction, reactionEnergyCost);
        if(reaction.primary === "dodge") {
            triggerEvent({
                type: "on_dodge",
                source: {
                    character: targetedCharacter,
                    attack: attackEvent
                },
                target: actingCharacter,
                combatants: {
                    [actingCharacter.id]: actingCharacter,
                    [targetedCharacter.id]: targetedCharacter
                },
                roundEvents
            });
        }
        roundEvents.push(attackEvent);
        return;
    }
    const baseDamage = calculateDamageBy(actingCharacter).using(action)
        .against(targetedCharacter).using(reaction)[hitLevel];
    const damageDone = baseDamage;
    targetedCharacter.dealDamage(damageDone);
    const damageType = action.enhancements.reduce((type, nextEnhancement) => {
        return _.get(ActionEnhancements, [nextEnhancement.enhancement, "change_damage_type"], type)
    }, "physical");
    const attackResult = generateHitEvents(hitLevel, actingCharacter, targetedCharacter, damageDone, damageType, action, actionEnergyCost, reaction, reactionEnergyCost);
    roundEvents.push(attackResult.attack);
    roundEvents.push(attackResult.damage);
    triggerEvent({
        type: "on_hit",
        source: {
            character: actingCharacter,
            attack: attackResult.attack
        },
        target: targetedCharacter,
        combatants: {
            [actingCharacter.id]: actingCharacter,
            [targetedCharacter.id]: targetedCharacter
        },
        roundEvents
    });
    triggerEvent({
        type: `on_${HitTypes[attackResult.hitType].summary}_hit`,
        source: {
            character: actingCharacter,
            attack: attackResult.attack
        },
        target: targetedCharacter,
        combatants: {
            [actingCharacter.id]: actingCharacter,
            [targetedCharacter.id]: targetedCharacter
        },
        roundEvents
    });
    if(!targetedCharacter.isAlive) {
        roundEvents.push(generateKillEvent(actingCharacter, targetedCharacter));
    }
    if (attackResult.damage) {
        onTakingDamage(targetedCharacter, actingCharacter, attackResult.attack, attackResult.damage, roundEvents);
    }
}