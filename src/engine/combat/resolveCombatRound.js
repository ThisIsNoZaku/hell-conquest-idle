import resolveAttack from "./resolveAttack";
import Decimal from "decimal.js";
import * as JOI from "joi";
import triggerEvent from "../general/triggerEvent";
import {HitTypes} from "../../data/HitTypes";
import calculateDamageFromFatigue from "./calculateDamageFromFatigue";
import {Character} from "../../character";
import {v4} from "node-uuid";
import {getConfigurationValue} from "../../config";

export default function resolveCombatRound(tick, combatants) {
    const validation = combatantsSchema.validate(combatants);
    if (validation.error) {
        throw new Error(`Error resolving combat round: ${validation.error}`);
    }
    const initiativeOrder = Object.values(combatants).sort((a, b) => a.id - b.id);

    let roundEvents = [];

    // Trigger on_begin_round
    Object.values(combatants).forEach(combatant => {
        triggerEvent(
            {
                type: "on_round_begin",
                source: combatant,
                combatants,
                roundEvents
            }
        );
    });

    initiativeOrder.forEach(actingCharacter => {
        if (!actingCharacter.isAlive) {
            return;
        }
        const possibleTargets = Object.values(combatants).filter(c => c.party !== actingCharacter.id);
        const actionTarget = possibleTargets[0];
        const attackResult = resolveAttack(tick, actingCharacter, actionTarget);
        roundEvents = roundEvents.concat(attackResult.effects);
        triggerEvent({
            type: "on_hit",
            roundEvents,
            source: actingCharacter,
            target: actionTarget,
            combatants,
        });
        triggerEvent({
            type: `on_${HitTypes[attackResult.hitType].summary}_hit`,
            roundEvents,
            source: actingCharacter,
            target: actionTarget,
            combatants,
        });
        triggerEvent({
            type: `on_taking_damage`,
            roundEvents,
            source: actingCharacter,
            target: actionTarget,
            combatants
        });

        Object.values(combatants).forEach(combatant => {
            if (Decimal(combatant.hp).lte(0)) {
                roundEvents.push({
                    event: "kill",
                    source: actingCharacter.id,
                    target: actionTarget.id
                });
            }
        });

        if (actingCharacter.combat.stamina.lte(0) && actingCharacter.isAlive) {
            const damageToInflictDueToFatigue = calculateDamageFromFatigue(actingCharacter);
            actingCharacter.hp = Decimal.max(0, actingCharacter.hp.minus(damageToInflictDueToFatigue));
            roundEvents.push({
                uuid: v4(),
                event: "fatigue-damage",
                source: actingCharacter.id,
                target: actingCharacter.id,
                value: damageToInflictDueToFatigue
            });
            if (actingCharacter.hp.lte(0)) {
                roundEvents.push({
                    event: "kill",
                    source: actingCharacter.id,
                    target: actingCharacter.id
                });
            }
        } else {
            const perRoundStamina = getConfigurationValue("stamina_consumed_per_round");
            actingCharacter.combat.stamina = Decimal.max(actingCharacter.combat.stamina.minus(perRoundStamina), 0);
        }
    });

    Object.values(combatants).forEach(combatant => {
        triggerEvent(
            {
                type: "on_round_end",
                combatants,
                roundEvents,
                source: combatant
            }
        );
    })

    return {
        initiativeOrder: initiativeOrder.map(c => c.id),
        events: roundEvents,
        tick,
        end: Object.values(combatants).some(c =>!c.isAlive)
    }
}

const combatantsSchema = JOI.object().pattern(JOI.number(), JOI.object().instance(Character));