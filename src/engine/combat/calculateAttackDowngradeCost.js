import evaluateExpression from "../general/evaluateExpression";
import {Traits} from "../../data/Traits";
import {Decimal} from "decimal.js";
import * as _ from "lodash";
import {Statuses} from "../../data/Statuses";

export default function calculateAttackDowngradeCost(attacker, target) {
    const baseCost = _.get(target, ["combat","incomingAttackDowngradeCost"], Decimal(100)); // Inner calculation already includes its own traits/statuses.
    const targetTraitMultiplier = Object.keys(_.get(target, "traits", {})).reduce((previousValue, currentValue) => {
        const effectDef = _.get(Traits[currentValue], ["continuous", "trigger_effects", "attack_downgrade_cost_multiplier"]);
        const effectModifier = _.get(effectDef, "target") === "source_character" ? evaluateExpression(effectDef.modifier, {
            rank: Decimal(target.traits[currentValue])
        }) : 0;
        return previousValue.plus(effectModifier)
    }, Decimal(1));
    const targetStatusMultiplier = Object.keys(_.get(target, "statuses", {})).reduce((previousValue, currentValue) => {
        const effectDef = _.get(Statuses[currentValue], ["effects", "attack_downgrade_cost_multiplier"]);
        const effectModifier = _.get(effectDef, "target") === "source_character" ? evaluateExpression(effectDef.modifier, {
            rank: Decimal(target.traits[currentValue])
        }) : 0;
        return previousValue.plus(effectModifier);
    }, Decimal(1));
    return baseCost
        .times(targetTraitMultiplier)
        .times(targetStatusMultiplier)
        .floor();

}