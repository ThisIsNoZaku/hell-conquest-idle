import evaluateExpression from "../general/evaluateExpression";
import {Traits} from "../../data/Traits";
import {Decimal} from "decimal.js";
import * as _ from "lodash";
import {Statuses} from "../../data/Statuses";
import {getConfigurationValue} from "../../config";

const minimumCost = getConfigurationValue("minimum_attack_downgrade_cost");

export default function calculateAttackDowngradeCost(character, enemy) {
    const baseCost = Decimal(getConfigurationValue("base_attack_downgrade_cost")); // Inner calculation already includes its own traits/statuses.
    const enemyLevelFactor = Decimal(_.get(enemy, "powerLevel", Decimal(0))).times(getConfigurationValue("attack_downgrade_cost_per_enemy_level"));
    const defenderMultiplier = Decimal(_.get(character, ["combat", "incomingAttackDowngradeCostMultiplier"], 0));
    const targetTraitMultiplier = Object.keys(_.get(enemy, "traits", {})).reduce((previousValue, currentValue) => {
        const effectDef = _.get(Traits[currentValue], ["continuous", "trigger_effects", "attack_downgrade_cost_multiplier"]);
        const effectModifier = _.get(effectDef, "target") === "enemy" ? evaluateExpression(effectDef.value, {
            tier: Decimal(enemy.traits[currentValue])
        }) : 0;
        return previousValue.plus(effectModifier)
    }, Decimal(0));
    const targetStatusMultiplier = Object.keys(_.get(enemy, "statuses", {})).reduce((previousValue, currentValue) => {
        const effectDef = _.get(Statuses[currentValue], ["effects", "attack_downgrade_cost_multiplier"]);
        const effectModifier = _.get(effectDef, "target") === "enemy" ? evaluateExpression(effectDef.value, {
            tier: Decimal(enemy.getStatusStacks(currentValue))
        }) : 0;
        return previousValue.plus(effectModifier);
    }, Decimal(0));
    const totalMultiplier = Decimal.max(0, Decimal(1).plus(defenderMultiplier.plus(targetTraitMultiplier)
        .plus(targetStatusMultiplier)));
    return Decimal.max(1, baseCost
        .plus(enemyLevelFactor)
        .times(totalMultiplier))
        .floor();
}