import {Decimal} from "decimal.js";
import * as _ from "lodash";
import { config } from "../../config";

export default function calculateDamageBy(attacker) {
    return {
        against: function (target) {
            const attackerPower = attacker.combat.power;
            const powerMultiplier = Decimal(config.mechanics.combat.power.effectPerPoint).plus(1)
                .pow(attackerPower);
            const defenderResilience = _.get(target, ["combat", "resilience"], 0);
            const resilienceMultiplier = Decimal(1).minus(config.mechanics.combat.power.effectPerPoint)
                .pow(defenderResilience);
            const damageModifier = powerMultiplier.times(resilienceMultiplier);
            return {
                min: attacker.combat.minimumDamage.times(damageModifier).ceil(),
                med: attacker.combat.medianDamage.times(damageModifier).ceil(),
                max: attacker.combat.maximumDamage.times(damageModifier).ceil()
            }
        }
    }

}