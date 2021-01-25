import resolveAttack from "./resolveAttack";
import Decimal from "decimal.js";
import * as JOI from "joi";
import triggerEvent from "../general/triggerEvent";
import {HitTypes} from "../../data/HitTypes";
import calculateDamageFromFatigue from "./calculateDamageFromFatigue";
import {Character} from "../../character";
import {getConfigurationValue} from "../../config";
import {
    generateFatigueDamageEvent,
    generateKillEvent,
    generateRemoveStatusEvent,
    generateStaminaChangeEvent
} from "../events/generate";
import {getCharacter} from "../index";
import {FOR_COMBAT, PERMANENT} from "../../data/Statuses";
import * as _ from "lodash";

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
                source: {character: combatant},
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
        if (!HitTypes[attackResult.hitType].preventHit) {
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

        if (actingCharacter.isAlive) {
            actingCharacter.combat.fatigue = Decimal(actingCharacter.combat.fatigue).plus(1);
            // Recover stamina
            if (actingCharacter.combat.maximumStamina.eq(0)) {
                const damageToInflictDueToFatigue = calculateDamageFromFatigue(actingCharacter);
                actingCharacter.hp = Decimal.max(0, actingCharacter.hp.minus(damageToInflictDueToFatigue));
                roundEvents.push(generateFatigueDamageEvent(actingCharacter, actingCharacter, damageToInflictDueToFatigue));
                if (!actingCharacter.isAlive && !roundEvents.find(re => re.type === "kill")) {
                    roundEvents.push(generateKillEvent(actingCharacter.id !== 0 ? getCharacter(0) : actingCharacter, actingCharacter));
                }
            } else {
                actingCharacter.combat.stamina = Decimal.min(actingCharacter.combat.stamina.plus(actingCharacter.combat.staminaRecovery), actingCharacter.combat.maximumStamina);
                roundEvents.push(generateStaminaChangeEvent(actingCharacter, actingCharacter, actingCharacter.combat.staminaRecovery));
            }
        }
    });

    Object.values(combatants).forEach(combatant => {
        triggerEvent(
            {
                type: "on_round_end",
                combatants,
                roundEvents,
                source: {character: combatant}
            }
        );
        Object.keys(combatant.statuses).forEach(status => {
            if (combatant.statuses[status]) {
                combatant.statuses[status] = combatant.statuses[status].filter(instance => {
                    if (instance.duration === PERMANENT || instance.duration === FOR_COMBAT || instance.duration) {
                        return true;
                    }
                    roundEvents.push(generateRemoveStatusEvent(getCharacter(instance.source.character), combatant, instance.uuid, status, 1));
                    return false;
                })
                    .map(instance => {
                        instance.duration--;
                        return instance;
                    })
            }
            if (combatant.statuses[status] && combatant.statuses[status].length === 0) {
                delete combatant.statuses[status];
            }
        })
    })

    return {
        initiativeOrder: initiativeOrder.map(c => c.id),
        events: roundEvents,
        tick,
        end: Object.values(combatants).some(c => !c.isAlive)
    }
}

const combatantsSchema = JOI.object().pattern(JOI.number(), JOI.object().instance(Character));