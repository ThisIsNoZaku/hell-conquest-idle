import {Decimal} from "decimal.js";
import * as _ from "lodash";
import {getConfigurationValue} from "../../config";
import {debugMessage} from "../../debugging";
import {HitTypes} from "../../data/HitTypes";

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
            const damageModifier = getConfigurationValue("mechanics.combat.attributeDifferenceMultipliers")[attributeDifference];
            debugMessage(`Final damage multiplier = ${damageModifier}.`);
            return Object.keys(HitTypes).reduce((damage, nextType) => {
                damage[nextType] = attacker.combat.damage[nextType].times(damageModifier).floor();
                return damage;
            }, {
                base: attacker.combat.medianDamage,
                multiplier: damageModifier
            })
        }
    }

}