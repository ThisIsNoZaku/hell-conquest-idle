import {getConfigurationValue} from "../../config";
import {Decimal} from "decimal.js";
import * as _ from "lodash";

export default function getHitChanceBy(attackingCharacter) {
    return {
        against: function(targetCharacter) {
            const attackerPrecision = attackingCharacter.combat.precision;
            const targetEvasion = Decimal(_.get(targetCharacter, ["combat", "evasion"], 0));
            const attributeDifference = Decimal.max(-10, Decimal.min(10, attackerPrecision.minus(targetEvasion))).round();
            const attributeModifier = getConfigurationValue("mechanics.combat.attributeDifferenceMultipliers")[attributeDifference];
            return {
                min: Decimal(getConfigurationValue("mechanics.combat.baseMinimumDamageWeight"))
                    .div(attributeModifier),
                med: Decimal(getConfigurationValue("mechanics.combat.baseMedianDamageWeight"))
                    .plus(targetEvasion).plus(attackerPrecision),
                max: Decimal(getConfigurationValue("mechanics.combat.baseMaximumDamageWeight"))
                    .times(attributeModifier),
            }
        }
    }
}