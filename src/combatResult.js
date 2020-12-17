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

export function generateMissCombatResult() {

}