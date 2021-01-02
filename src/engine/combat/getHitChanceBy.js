import {config} from "../../config";
import {Decimal} from "decimal.js";
import * as _ from "lodash";

export default function getHitChanceBy(attackingCharacter) {
    return {
        against: function(targetCharacter) {
            const attackerPrecision = attackingCharacter.combat.precision;
            const targetEvasion = Decimal(_.get(targetCharacter, ["combat", "evasion"], 0));
            return {
                min: Decimal(config.mechanics.combat.baseMinimumDamageWeight)
                    .plus(targetEvasion.times(3)),
                med: Decimal(config.mechanics.combat.baseMedianDamageWeight)
                    .plus(targetEvasion).plus(attackerPrecision),
                max: Decimal(config.mechanics.combat.baseMaximumDamageWeight)
                    .plus(attackerPrecision.times(2)),
            }
        }
    }
}