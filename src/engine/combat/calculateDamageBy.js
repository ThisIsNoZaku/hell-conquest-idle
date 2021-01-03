import {Decimal} from "decimal.js";
import * as _ from "lodash";
import { config } from "../../config";

export default function calculateDamageBy(attacker) {
    return {
        against: function (target) {
            const powerMultiplier = Decimal(attacker.combat.power
                .times(config.mechanics.combat.power.effectPerPoint));
            const resilienceMultiplier = Decimal(_.get(target, ["combat", "resilience"], 0)).times(config.mechanics.combat.power.effectPerPoint);
            const damageModifier = powerMultiplier.minus(resilienceMultiplier).plus(1);
            return {
                min: attacker.combat.minimumDamage.times(damageModifier).ceil(),
                med: attacker.combat.medianDamage.times(damageModifier).ceil(),
                max: attacker.combat.maximumDamage.times(damageModifier).ceil()
            }
        }
    }

}