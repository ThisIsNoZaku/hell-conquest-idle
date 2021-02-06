import resolveAttack from "../resolveAttack";
import triggerEvent from "../../general/triggerEvent";
import {HitTypes} from "../../../data/HitTypes";
import {generateActionSkipEvent} from "../../events/generate";
import {CombatActions} from "../../../data/CombatActions";


export default function resolveAction(actingCharacter, action, targetCharacter, reaction, roundEvents, tick) {
    if (CombatActions[action.primary].attack) {
        resolveAttack(actingCharacter, action, targetCharacter, reaction, roundEvents, tick);
        switch (action.primary) {
            case "none":
                actingCharacter.initiative = 0;
                break;
            case "basicAttack":
                actingCharacter.initiative -= 5;
                break;
            case "powerAttack":
                actingCharacter.initiative -= 10;
                break;
        }
        switch (reaction.primary) {
            case "block":
                actingCharacter.initiative -= 5;
                targetCharacter.initiative -= 5;
                break;
            case "dodge":
                actingCharacter.initiative -= 5;
                targetCharacter.initiative += 10;
                break;
            case "none":
                targetCharacter.initiative = 0;
                break;
        }
    } else {
        roundEvents.push(generateActionSkipEvent(actingCharacter, tick, "to save energy"));
    }
}