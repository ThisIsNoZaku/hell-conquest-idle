import resolveAttack from "../resolveAttack";
import triggerEvent from "../../general/triggerEvent";
import {HitTypes} from "../../../data/HitTypes";
import {generateActionSkipEvent} from "../../events/generate";
import {CombatActions} from "../../../data/CombatActions";


export default function resolveAction(actingCharacter, action, targetCharacter, reaction, roundEvents, tick) {
    if (CombatActions[action.primary].attack) {
        resolveAttack(actingCharacter, action, targetCharacter, reaction, roundEvents, tick);
    } else {
        roundEvents.push(generateActionSkipEvent(actingCharacter, tick, "to save energy"));
    }
}