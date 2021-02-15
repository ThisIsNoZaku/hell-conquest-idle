import triggerEvent from "../../general/triggerEvent";
import {DURATION_FOR_COMBAT, DURATION_PERMANENT} from "../../../data/Statuses";
import {generateFatigueDamageEvent, generateKillEvent, generateRemoveStatusEvent} from "../../events/generate";
import {getCharacter} from "../../index";
import {Decimal} from "decimal.js";

export default function onCombatRoundEnd(combatants, roundEvents, tick) {
    const everyoneAlive = Object.values(combatants).every(c => c.isAlive);
    if(everyoneAlive) {
        Object.values(combatants).forEach(combatant => {
            if (!combatant.isAlive) {
                return;
            }
            triggerEvent(
                {
                    type: "on_round_end",
                    combatants,
                    roundEvents
                }
            );


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
            // Gain end-of-round Energy
            const endOfRoundStaminaGain = Decimal.min(combatant.energyGeneration.times(tick - combatant.lastActedTick).floor(), combatant.combat.maximumStamina.minus(combatant.combat.stamina));
            combatant.combat.fatigue = Decimal(combatant.combat.fatigue).plus(endOfRoundStaminaGain);
            combatant.combat.stamina = Decimal.min(combatant.combat.stamina.plus(Decimal.max(endOfRoundStaminaGain, 0)), combatant.combat.maximumStamina);
            const burnDamage = Decimal.max(0, combatant.combat.fatigue.minus(combatant.combat.maximumStamina).div(10)).floor();
            if (burnDamage.gt(0)) {
                roundEvents.push(generateFatigueDamageEvent(combatant, combatant, burnDamage));
                combatant.dealDamage(burnDamage, "burn");
                if (!combatant.isAlive) {
                    roundEvents.push(generateKillEvent(combatant, combatant));
                }
            }
            combatant.lastActedTick = tick;
        });
    }
}