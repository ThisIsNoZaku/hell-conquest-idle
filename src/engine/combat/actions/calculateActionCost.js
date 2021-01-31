import {getConfigurationValue} from "../../../config";
import calculateAttributeDifferentMultiplier from "../calculateAttributeDifferentMultiplier";
import {AttackActions} from "../../../data/CombatActions";
import {Decimal} from "decimal.js";
import * as _ from "lodash";
export default function calculateActionCost(actor, action, target) {
    const base = Decimal(_.get(target, "powerLevel", 1)).times(getConfigurationValue("attack_upgrade_cost_per_enemy_level"));
    const attributeMultiplier = Decimal(1).minus(Decimal(_.get(actor, ["combat", "precision"], 1)).times(getConfigurationValue("mechanics.combat.precision.effectPerPoint")));
    const actionCostMultiplier = AttackActions[action.primary].energyCostMultiplier;
    const enhancementModifier = action.enhancements.reduce((previousValue, currentValue, currentIndex) => {
        return previousValue + (currentValue.additional_energy_cost_modifier || 0);
    }, 0);

    return base.times(attributeMultiplier.plus(enhancementModifier))
        .times(actionCostMultiplier).floor();

}