import {v4} from "node-uuid";

export function generateHitCombatResult(tick, attackingCharacterId, targetCharacterId, damageDone) {
    return {
        uuid: v4(),
        tick,
        result: "hit",
        target: targetCharacterId,
        actor: attackingCharacterId,
        effects: [{
            event: "damage",
            value: damageDone,
            target: targetCharacterId
        }]
    }
}

export function generateMissCombatResult(tick, attackingCharacterId, targetCharacterId) {
    return {
        uuid: v4(),
        tick,
        result: "miss",
        target: targetCharacterId,
        actor: attackingCharacterId,
        effects: []
    }
}

export function generateSkipActionResult(tick, actingCharacterId) {
    return {
        uuid: v4(),
        tick,
        result: "action_skipped",
        actor: actingCharacterId,
        effects: []
    }
}