import {Decimal} from "decimal.js";
import * as _ from "lodash";
import { config } from "../../config";

export default function calculateDamageBy(attacker) {
    return {
        against: function (target) {
            const powerMultiplier = Decimal(config.mechanics.combat.power.effectPerPoint).plus(1)
                .pow(attacker.combat.power);
            const resilienceMultiplier = Decimal(1).minus(config.mechanics.combat.power.effectPerPoint)
                .pow(_.get(target, ["combat", "resilience"], 0));
            const damageModifier = powerMultiplier.minus(resilienceMultiplier).plus(1);
            return {
                min: attacker.combat.minimumDamage.times(damageModifier).ceil(),
                med: attacker.combat.medianDamage.times(damageModifier).ceil(),
                max: attacker.combat.maximumDamage.times(damageModifier).ceil()
            }
        }
    }

}