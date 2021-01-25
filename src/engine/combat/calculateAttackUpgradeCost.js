import evaluateExpression from "../general/evaluateExpression";
import {Traits} from "../../data/Traits";
import {Decimal} from "decimal.js";
import * as _ from "lodash";
import {Statuses} from "../../data/Statuses";
import {getConfigurationValue} from "../../config";

const minimumCost = getConfigurationValue("minimum_attack_upgrade_cost");

export default function calculateAttackUpgradeCost(character, enemy) {
    const baseCost = getConfigurationValue("base_attack_upgrade_cost"); // Inner calculation already includes its own traits/statuses.
    const enemyLevelFactor = Decimal(_.get(enemy, "powerLevel", Decimal(0))).times(getConfigurationValue("attack_upgrade_cost_per_enemy_level"));
    const attackerMultiplier = _.get(character, ["combat", "attackUpgradeCostMultiplier"], 1);
    const targetTraitMultiplier = Object.keys(_.get(enemy, "traits", {})).reduce((previousValue, currentValue) => {
        const effectDef = _.get(Traits[currentValue], ["continuous", "trigger_effects", "attack_upgrade_cost_multiplier"]);
        const effectModifier = _.get(effectDef, "target") === "enemy" ? evaluateExpression(effectDef.modifier, {
            tier: Decimal(enemy.traits[currentValue])
        }) : 0;
        return previousValue.plus(effectModifier)
    }, Decimal(1));
    const targetStatusMultiplier = Object.keys(_.get(enemy, "statuses", {})).reduce((previousValue, currentValue) => {
        const effectDef = _.get(Statuses[currentValue], ["effects", "attack_upgrade_cost_multiplier"]);
        const effectModifier = _.get(effectDef, "target") === "enemy" ? evaluateExpression(effectDef.modifier, {
            tier: Decimal(enemy.getStatusStacks(currentValue))
        }) : 0;
        return previousValue.plus(effectModifier);
    }, Decimal(1));
    return Decimal.max(1, baseCost)
        .plus(enemyLevelFactor)
        .times(attackerMultiplier)
        .times(targetTraitMultiplier)
        .times(targetStatusMultiplier)
        .floor();
}