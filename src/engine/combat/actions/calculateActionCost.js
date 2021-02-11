import {getConfigurationValue} from "../../../config";
import {CombatActions} from "../../../data/CombatActions";
import {Decimal} from "decimal.js";
import * as _ from "lodash";
import {ActionEnhancements} from "../../../data/ActionEnhancements";
import {Traits} from "../../../data/Traits";
import {Statuses} from "../../../data/Statuses";

export default function calculateActionCost(actor, action, enemy) {
    const base = Decimal(_.get(enemy, "powerLevel", 1)).times(getConfigurationValue("attack_upgrade_cost_per_enemy_level"));
    const attributeMultiplier =Decimal(1).minus(getConfigurationValue("mechanics.combat.precision.effectPerPoint")).pow(Decimal(_.get(actor, ["combat", "precision"], 1)));
    const actionCostMultiplier = CombatActions[action.primary].energyCostMultiplier;
    const enhancementModifier = action.enhancements.map(e => ActionEnhancements[e]).reduce((previousValue, currentValue, currentIndex) => {
        const thisModifier = (currentValue.additional_energy_cost_modifier || 0);
        const enemyStatusModifier = Object.keys(_.get(enemy, "statuses", {})).reduce((total, next)=>{
            const statusEffect = _.get(Statuses[next], ["effects", "enhancement_cost_increase"]);
            return total + (statusEffect.target === "enemy" ? statusEffect.value : 0);
        }, 0);
        return previousValue + (thisModifier + enemyStatusModifier);
    }, 0);
    const actorTraitModifier = Object.keys(_.get(actor, "traits",{})).reduce((total, next) => {
        const traitEffect = _.get(Traits[next], ["continuous", "trigger_effects", `${action.primary}_cost_modifier`], {});
        return total + (traitEffect.target === "self" ? traitEffect.value : 0);
    }, 0);
    const enemyTraitModifier = Object.keys(_.get(enemy, "traits",{})).reduce((total, next) => {
        const traitEffect = _.get(Traits[next], ["continuous", "trigger_effects", `${action.primary}_cost_modifier`], {});
        return total + (traitEffect.target === "enemy" ? traitEffect.value : 0);
    }, 0);

    return base.times(attributeMultiplier.plus(enhancementModifier).plus(actorTraitModifier).plus(enemyTraitModifier))
        .times(actionCostMultiplier).floor();

}