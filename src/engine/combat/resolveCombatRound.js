import resolveAttack from "./resolveAttack";
import * as JOI from "joi";
import triggerEvent from "../general/triggerEvent";
import {Character} from "../../character";
import onCombatRoundEnd from "./events/onCombatRoundEnd";
import determineCharacterCombatAction from "./actions/determineCharacterCombatAction";
import {CombatActions} from "../../data/CombatActions";
import * as _ from "lodash";
import onRoundBegin from "./events/onRoundBegin";
import onHit from "./events/onHit";
import onTakingDamage from "./events/onTakingDamage";

export default function resolveCombatRound(tick, combatants) {
    const validation = combatantsSchema.validate(combatants);
    if (validation.error) {
        throw new Error(`Error resolving combat round: ${validation.error}`);
    }
    const initiativeOrder = Object.values(combatants).sort((a, b) => {
        const initiative = _.get(b, "initiative", 0) - _.get(a, "initiative", 0);
        if(initiative !== 0) {
            return initiative;
        }
        return a.id - b.id;
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
        const result = resolveAttack(attacker, attack, defender, defense, tick);
        roundEvents.push(result.attack);
        if(result.attack.hit) {
            triggerEvent(
                {
                    type: "on_hit",
                    combatants,
                    roundEvents
                }
            );
        }
        if(result.damage) {
            onTakingDamage();
            roundEvents.push(result.damage);
        }
    } else if (CombatActions[firstCharacterAction.primary].attack && CombatActions[secondCharacterAction.primary].attack) {
        const firstResult = resolveAttack(initiativeOrder[0], firstCharacterAction, initiativeOrder[1], {primary: "none", enhancements: []}, tick);
        roundEvents.push(firstResult.attack);
        roundEvents.push(firstResult.damage);
        const secondResult = resolveAttack(initiativeOrder[1], secondCharacterAction, initiativeOrder[0], {primary: "none", enhancements: []}, tick);
        roundEvents.push(secondResult.attack);
        roundEvents.push(secondResult.damage);
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