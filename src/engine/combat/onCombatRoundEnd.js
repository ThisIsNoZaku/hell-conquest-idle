import triggerEvent from "../general/triggerEvent";
import {FOR_COMBAT, PERMANENT} from "../../data/Statuses";
import {generateFatigueDamageEvent, generateRemoveStatusEvent} from "../events/generate";
import {getCharacter} from "../index";
import {Decimal} from "decimal.js";
import {getConfigurationValue} from "../../config";

export default function onCombatRoundEnd(combatants, roundEvents, tick) {
    Object.values(combatants).forEach(combatant => {
        triggerEvent(
            {
                type: "on_round_end",
                combatants,
                roundEvents,
                source: {character: combatant}
            }
        );


        Object.keys(combatant.statuses).forEach(status => {
            if (combatant.statuses[status]) {
                combatant.statuses[status] = combatant.statuses[status].filter(instance => {
                    if (instance.duration === PERMANENT || instance.duration === FOR_COMBAT || instance.duration) {
                        return true;
                    }
                    roundEvents.push(generateRemoveStatusEvent(getCharacter(instance.source.character), combatant, instance.uuid, status, 1));
                    return false;
                })
                    .map(instance => {
                        instance.duration--;
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
        combatant.combat.stamina = Decimal.min(combatant.combat.stamina.plus(Decimal.max(endOfRoundStaminaGain, 50)), combatant.combat.maximumStamina);
        const burnDamage = Decimal.max(0, combatant.combat.fatigue.minus(combatant.combat.maximumStamina)).div(10).floor();
        if(burnDamage.gt(0)) {
            roundEvents.push(generateFatigueDamageEvent(combatant, combatant, burnDamage));
            combatant.hp = Decimal.max(0, combatant.hp.minus(burnDamage));
        }
        combatant.lastActedTick = tick;
    })
}