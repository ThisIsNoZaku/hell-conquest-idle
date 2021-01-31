import {getConfigurationValue} from "../../../config";
import calculateAttributeDifferentMultiplier from "../calculateAttributeDifferentMultiplier";
import {AttackActions} from "../../../data/CombatActions";
import {Decimal} from "decimal.js";

export default function calculateActionCost(actor, action, target) {
    const base = target.powerLevel.times(getConfigurationValue("attack_upgrade_cost_per_enemy_level"));
    const attributeMultiplier = Decimal(1).minus(actor.combat.precision.times(getConfigurationValue("mechanics.combat.precision.effectPerPoint")));
    const actionCostMultiplier = AttackActions[action.primary].energyCostMultiplier;
    const enhancementModifier = action.enhancements.reduce((previousValue, currentValue, currentIndex) => {
        return previousValue + (currentValue.additional_energy_cost_modifier || 0);
    }, 0);

    return base.times(attributeMultiplier.plus(enhancementModifier))
        .times(actionCostMultiplier).floor();

}