import {getConfigurationValue} from "../../../config";
import calculateAttributeDifferentMultiplier from "../calculateAttributeDifferentMultiplier";
import {AttackActions} from "../../../data/CombatActions";
import {Decimal} from "decimal.js";

export default function calculateActionCost(actor, action, target) {
    const base = target.powerLevel.times(getConfigurationValue("attack_upgrade_cost_per_enemy_level"));
    const attributeMultiplier = Decimal(1).minus(actor.combat.precision.times(getConfigurationValue("mechanics.combat.precision.effectPerPoint")));
    const actionCostMultiplier = AttackActions[action].energyCostMultiplier;

    return base.times(attributeMultiplier)
        .times(actionCostMultiplier).floor();

}