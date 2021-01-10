import resolveAttack from "./resolveAttack";
import * as _ from "lodash";
import CharacterCombatState from "../CharacterCombatState";

export default function resolveCombatRound(tick, combatContext) {
    const combatants = Object.values(combatContext.combatants)
        .reduce((previousValue, currentValue) => {
            previousValue[currentValue.id] = new CharacterCombatState(currentValue, currentValue.party);
            return previousValue;
        }, {});
    const initiativeOrder = Object.values(combatants).sort((a, b) => a.id - b.id);

    let roundEvents = [];
    initiativeOrder.forEach(actingCharacter => {
        const possibleTargets = Object.values(combatants).filter(c => c.party !== actingCharacter.id);
        const actionTarget = possibleTargets[0];
        const attackResult = resolveAttack(tick, actingCharacter, actionTarget);
        roundEvents = roundEvents.concat(attackResult);
    })

    return {
        initiativeOrder: initiativeOrder.map(c => c.id),
        characters: combatants,
        events: roundEvents,
        tick
    }
}