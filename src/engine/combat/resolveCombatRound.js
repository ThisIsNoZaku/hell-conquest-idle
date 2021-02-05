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
import resolveAction from "./actions/resolveAction";
import onCombatRoundEnd from "./onCombatRoundEnd";

export default function resolveCombatRound(tick, combatants) {
    const validation = combatantsSchema.validate(combatants);
    if (validation.error) {
        throw new Error(`Error resolving combat round: ${validation.error}`);
    }
    const initiativeOrder = Object.values(combatants).sort((a, b) => a.id - b.id);

    let roundEvents = [];

    // Trigger on_begin_round
    triggerEvent(
        {
            type: "on_round_begin",
            combatants,
            roundEvents
        }
    );
    const startingEnergy = Object.keys(combatants).reduce((mapped, next)=>{
        mapped[next] = combatants[next].combat.stamina;
        return mapped;
    }, {})

    initiativeOrder.forEach(actingCharacter => {
        if (!actingCharacter.isAlive) {
            return;
        }
        resolveAction(actingCharacter, combatants, roundEvents, startingEnergy, tick);

        Object.values(combatants).forEach(combatant => {
            if (!combatant.isAlive && !roundEvents.find(re => re.type === "kill" && re.target !== combatant.id)) {
                roundEvents.push(generateKillEvent(actingCharacter, combatant));
            }
        });
    });
    onCombatRoundEnd(combatants, roundEvents, tick);

    return {
        initiativeOrder: initiativeOrder.map(c => c.id),
        events: roundEvents,
        tick,
        end: Object.values(combatants).some(c => !c.isAlive)
    }
}

const combatantsSchema = JOI.object().pattern(JOI.number(), JOI.object().instance(Character));