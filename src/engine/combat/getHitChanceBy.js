import {config} from "../../config";
import {Decimal} from "decimal.js";
import * as _ from "lodash";

export default function getHitChanceBy(attackingCharacter) {
    return {
        against: function(targetCharacter) {
            const attackerPrecision = attackingCharacter.combat.precision;
            const targetEvasion = Decimal(_.get(targetCharacter, ["combat", "evasion"], 0));
            const attributeDifference = Decimal.max(-10, Decimal.min(10, attackerPrecision.minus(targetEvasion))).round();
            const attributeModifier = config.mechanics.combat.attributeDifferenceMultipliers[attributeDifference];
            return {
                min: Decimal(config.mechanics.combat.baseMinimumDamageWeight)
                    .div(attributeModifier),
                med: Decimal(config.mechanics.combat.baseMedianDamageWeight)
                    .plus(targetEvasion).plus(attackerPrecision),
                max: Decimal(config.mechanics.combat.baseMaximumDamageWeight)
                    .times(attributeModifier),
            }
        }
    }
}