import resolveAttack from "./resolveAttack";
import Decimal from "decimal.js";
import * as JOI from "joi";
import triggerEvent from "../general/triggerEvent";
import {HitTypes} from "../../data/HitTypes";
import calculateDamageFromFatigue from "./calculateDamageFromFatigue";
import {Character} from "../../character";
import {v4} from "node-uuid";
import {getConfigurationValue} from "../../config";
import {generateFatigueDamageEvent, generateKillEvent} from "../events/generate";

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
                source: {character:combatant},
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
            source: {
                character: actingCharacter,
                attack: attackResult.effects.find(ev => ev.event === "attack"),
                damage: attackResult.effects.find(ev => ev.event === "damage"),
            },
            target: actionTarget,
            combatants,
        });
        triggerEvent({
            type: `on_${HitTypes[attackResult.hitType].summary}_hit`,
            roundEvents,
            source: {
                character: actingCharacter,
                attack: attackResult.effects.find(ev => ev.event === "attack"),
                damage: attackResult.effects.find(ev => ev.event === "damage"),
            },
            target: actionTarget,
            combatants,
        });
        if(!HitTypes[attackResult.hitType].preventHit) {
            triggerEvent({
                type: `on_taking_damage`,
                roundEvents,
                source: {
                    character: actionTarget,
                    attack: attackResult.effects.find(ev => ev.event === "attack"),
                    damage: attackResult.effects.find(ev => ev.event === "damage"),
                },
                target: actingCharacter,
                combatants
            });
        }

        Object.values(combatants).forEach(combatant => {
            if (!combatant.isAlive && !roundEvents.find(re => re.type === "kill" && re.target !== combatant.id)) {
                roundEvents.push(generateKillEvent(actingCharacter, combatant));
            }
        });

        if (actingCharacter.combat.stamina.lte(0) && actingCharacter.isAlive && !roundEvents.find(re => re.type === "kill")) {
            const damageToInflictDueToFatigue = calculateDamageFromFatigue(actingCharacter);
            actingCharacter.hp = Decimal.max(0, actingCharacter.hp.minus(damageToInflictDueToFatigue));
            roundEvents.push(generateFatigueDamageEvent(actingCharacter, actingCharacter, damageToInflictDueToFatigue));
            if (!actingCharacter.isAlive && !roundEvents.find(re => re.type === "kill" && re.target !== actingCharacter.id)) {
                roundEvents.push(generateKillEvent(actingCharacter, actingCharacter));
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
                source: {character:combatant}
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