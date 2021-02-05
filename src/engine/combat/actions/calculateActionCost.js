import {getConfigurationValue} from "../../../config";
import calculateAttributeDifferentMultiplier from "../calculateAttributeDifferentMultiplier";
import {CombatActions} from "../../../data/CombatActions";
import {Decimal} from "decimal.js";
import * as _ from "lodash";
import {ActionEnhancements} from "../../../data/ActionEnhancements";
import {Traits} from "../../../data/Traits";
export default function calculateActionCost(actor, action, target) {
    const base = Decimal(_.get(target, "powerLevel", 1)).times(getConfigurationValue("attack_upgrade_cost_per_enemy_level"));
    const attributeMultiplier =Decimal(1).minus(getConfigurationValue("mechanics.combat.precision.effectPerPoint")).pow(Decimal(_.get(actor, ["combat", "precision"], 1)));
    const actionCostMultiplier = CombatActions[action.primary].energyCostMultiplier;
    const enhancementModifier = action.enhancements.map(e => ActionEnhancements[e]).reduce((previousValue, currentValue, currentIndex) => {
        return previousValue + (currentValue.additional_energy_cost_modifier || 0);
    }, 0);

    return base.times(attributeMultiplier.plus(enhancementModifier))
        .times(actionCostMultiplier).floor();

}