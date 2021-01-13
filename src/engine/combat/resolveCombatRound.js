import resolveAttack from "./resolveAttack";
import Decimal from "decimal.js";
import * as JOI from "joi";
import triggerEvent from "../general/triggerEvent";
import {HitTypes} from "../../data/HitTypes";

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

        Object.values(combatants).forEach(combatant => {
            if (combatant.hp.lte(0)) {
                roundEvents.push({
                    event: "kill",
                    source: actingCharacter.id,
                    target: actionTarget.id
                });
            }
        });
        actingCharacter.fatigue = actingCharacter.fatigue.plus(1);
        if (actingCharacter.fatigue.gt(actingCharacter.endurance) && actingCharacter.isAlive) {
            const damageToInflictDueToFatigue = actingCharacter.damageFromFatigue;
            actingCharacter.hp = Decimal.max(0, actingCharacter.hp.minus(damageToInflictDueToFatigue));
            roundEvents.push({
                event: "fatigue-damage",
                source: actingCharacter.id,
                target: actingCharacter.id,
                value: damageToInflictDueToFatigue
            });
            if (actingCharacter.hp.lte(0)) {
                roundEvents.push({
                    event: "kill",
                    source: null,
                    target: actingCharacter.id
                });
            }
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
        tick
    }
}

const combatantsSchema = JOI.object();