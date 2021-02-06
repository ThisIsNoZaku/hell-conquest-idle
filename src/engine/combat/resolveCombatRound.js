import resolveAttack from "./resolveAttack";
import * as JOI from "joi";
import triggerEvent from "../general/triggerEvent";
import {Character} from "../../character";
import onCombatRoundEnd from "./events/onCombatRoundEnd";
import determineCharacterCombatAction from "./actions/determineCharacterCombatAction";
import {CombatActions} from "../../data/CombatActions";
import * as _ from "lodash";
import resolveAction from "./actions/resolveAction";
import {generateActionSkipEvent} from "../events/generate";

export default function resolveCombatRound(tick, combatants) {
    const validation = combatantsSchema.validate(combatants);
    if (validation.error) {
        throw new Error(`Error resolving combat round: ${validation.error}`);
    }
    const initiativeOrder = Object.values(combatants).sort((a, b) => {
        const initiative = _.get(a, "initiative", 0) - _.get(b, "initiative", 0);
        if(initiative !== 0) {
            return initiative;
        }
        return b.id - a.id;
    }); // FIXME: Determine initiative in own function.

    let roundEvents = [];

    // Trigger on_begin_round
    triggerEvent(
        {
            type: "on_round_begin",
            combatants,
            roundEvents
        }
    );

    const firstCharacterAction = determineCharacterCombatAction(initiativeOrder[0], initiativeOrder[1]);
    const secondCharacterAction = determineCharacterCombatAction(initiativeOrder[1], initiativeOrder[0], firstCharacterAction);
    if((CombatActions[firstCharacterAction.primary].attack && CombatActions[secondCharacterAction.primary].defense) ||
        (CombatActions[firstCharacterAction.primary].defense && CombatActions[secondCharacterAction.primary].attack)) {
        const attacker = CombatActions[firstCharacterAction.primary].attack ? initiativeOrder[0] : initiativeOrder[1];
        const attack = CombatActions[firstCharacterAction.primary].attack ? firstCharacterAction : secondCharacterAction;
        const defender = CombatActions[firstCharacterAction.primary].defense ? initiativeOrder[0] : initiativeOrder[1];
        const defense = CombatActions[firstCharacterAction.primary].defense ? firstCharacterAction : secondCharacterAction;
        resolveAction(attacker, attack, defender, defense, roundEvents, tick);
    } else if (CombatActions[firstCharacterAction.primary].attack && CombatActions[secondCharacterAction.primary].attack) {
        resolveAction(initiativeOrder[0], firstCharacterAction, initiativeOrder[1], {primary: "none", enhancements: []}, roundEvents, tick);
        resolveAction(initiativeOrder[1], secondCharacterAction, initiativeOrder[0], {primary: "none", enhancements: []}, roundEvents, tick);
    }
    if(firstCharacterAction.primary === "none") {
        roundEvents.push(generateActionSkipEvent(initiativeOrder[0], tick, "to gain energy"));
    }

    if(secondCharacterAction.primary === "none") {
        roundEvents.push(generateActionSkipEvent(initiativeOrder[1], tick, "to gain energy"));
    }
    onCombatRoundEnd(combatants, roundEvents, tick);

    return {
        initiativeOrder: initiativeOrder.map(c => c.id),
        events: roundEvents,
        tick,
        end: Object.values(combatants).some(c => !c.isAlive)
    }
}

const combatantsSchema = JOI.object().pattern(JOI.number(), JOI.object().instance(Character));