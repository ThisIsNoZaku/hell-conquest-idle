import {config} from "../../config";
import {Decimal} from "decimal.js";

export default function getHitChanceBy(attackingCharacter) {
    return {
        against: function(targetCharacter) {
            const targetEvasionModifier = targetCharacter !== undefined ? targetCharacter.attributes[config.mechanics.combat.evasion.baseAttribute]
                .times(config.mechanics.combat.evasion.attributeBonusScale) : Decimal(0);
            const attackerAccuracyModifier = attackingCharacter.attributes[config.mechanics.combat.precision.baseAttribute]
                .times(config.mechanics.combat.precision.attributeBonusScale);
            return {
                minimum: Decimal(config.mechanics.combat.baseMinimumDamageWeight)
                    .plus(targetEvasionModifier.times(2)).floor(),
                median: Decimal(config.mechanics.combat.baseMedianDamageWeight)
                    .plus(targetEvasionModifier).plus(attackerAccuracyModifier).floor(),
                max: Decimal(config.mechanics.combat.baseMaximumDamageWeight)
                    .plus(attackerAccuracyModifier.times(2))
                    .floor()
            }
        }
    }
}