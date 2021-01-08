import {Decimal} from "decimal.js";
import * as _ from "lodash";
import { config } from "../../config";
import {debugMessage} from "../../debugging";

export default function calculateDamageBy(attacker) {
    return {
        against: function (target, debugOutput) {
            const attackerPower = attacker.combat.power;
            debugMessage(`Attacker ${attacker.id} has power ${attackerPower}.`);
            const defenderResilience = _.get(target, ["combat", "resilience"], attackerPower);

            if(target) {
                debugMessage(`Defender ${target.id} has resilience ${defenderResilience}.`);
            } else {
                debugMessage(`No target means an effective resilience of ${defenderResilience}`)
            }
            Decimal.set({rounding: Decimal.ROUND_DOWN});
            const attributeDifference = Decimal.min(10, Decimal.max(-10, attackerPower.minus(defenderResilience))).round().toFixed();
            const damageModifier = config.mechanics.combat.attributeDifferenceMultipliers[attributeDifference];
            debugMessage(`Final damage multiplier = ${damageModifier}. Min: ${Decimal(attacker.combat.minimumDamage).times(damageModifier).ceil()} Med: ${Decimal(attacker.combat.medianDamage).times(damageModifier).ceil()} Max: ${Decimal(attacker.combat.maximumDamage).times(damageModifier).ceil()}`);
            return {
                base: attacker.combat.medianDamage,
                multiplier: damageModifier,
                min: Decimal(attacker.combat.minimumDamage).times(damageModifier).ceil(),
                med: Decimal(attacker.combat.medianDamage).times(damageModifier).ceil(),
                max: Decimal(attacker.combat.maximumDamage).times(damageModifier).ceil()
            }
        }
    }

}