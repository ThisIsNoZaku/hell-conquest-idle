import {Decimal} from "decimal.js";
import * as _ from "lodash";
import { config } from "../../config";

export default function calculateDamageBy(attacker) {
    return {
        against: function (target) {
            const damageMultiplier = Decimal(attacker.combat.power
                .times(config.mechanics.combat.power.effectPerPoint)).plus(100);
            const damageDivisor = Decimal(_.get(target, ["combat", "resilience"], 0)).times(config.mechanics.combat.power.effectPerPoint).plus(100);
            const damageModifier = damageMultiplier.div(damageDivisor);
            return {
                min: attacker.combat.minimumDamage.times(damageModifier).ceil(),
                med: attacker.combat.medianDamage.times(damageModifier).ceil(),
                max: attacker.combat.maximumDamage.times(damageModifier).ceil()
            }
        }
    }

}