import triggerEvent from "../../general/triggerEvent";
import {DURATION_FOR_COMBAT, DURATION_PERMANENT} from "../../../data/Statuses";
import {generateFatigueDamageEvent, generateKillEvent, generateRemoveStatusEvent} from "../../events/generate";
import {getCharacter} from "../../index";
import Decimal from "decimal.js";

export default function onCombatRoundEnd(combatants, roundEvents, tick) {
    const everyoneAlive = Object.values(combatants).every(c => c.isAlive);
    if (everyoneAlive) {
        triggerEvent(
            {
                type: "on_round_end",
                combatants,
                roundEvents
            }
        );
        Object.values(combatants).forEach(combatant => {
            if (!combatant.isAlive) {
                return;
            }

            Object.keys(combatant.statuses).forEach(status => {
                if (combatant.statuses[status]) {
                    combatant.statuses[status] = combatant.statuses[status].filter(instance => {
                        if (instance.duration === DURATION_PERMANENT || instance.duration === DURATION_FOR_COMBAT || instance.duration) {
                            return true;
                        }
                        roundEvents.push(generateRemoveStatusEvent(getCharacter(instance.source.character), combatant, instance.uuid, status, 1));
                        return false;
                    })
                        .map(instance => {
                            if (instance.duration > 0) {
                                instance.duration--;
                            }
                            return instance;
                        })
                }
                if (combatant.statuses[status] && combatant.statuses[status].length === 0) {
                    delete combatant.statuses[status];
                }
            });
            combatant.lastActedTick = tick;
        });
    }
}