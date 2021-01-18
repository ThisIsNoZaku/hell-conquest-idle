import {getConfigurationValue} from "../../config";
import * as _ from "lodash";
import {Decimal} from "decimal.js";
import {Traits} from "../../data/Traits";
import evaluateExpression from "./evaluateExpression";

export default _.memoize(function (powerLevel, traits) {
    const minimumStamina = Decimal(getConfigurationValue("minimum_stamina"));
    const traitMultiplier = Object.keys(traits).reduce((total, trait) => {
        const staminaModifier = _.get(Traits, ["trait", "continuous", "trigger_effects", "stamina_modifier"]);
        if(_.get(staminaModifier, "target") === "self") {
            const modifier = evaluateExpression(staminaModifier.target, {
                rank: Decimal(trait[trait])
            });
            return total.plus(modifier);
        }
        return total;
    }, Decimal(1));
    return minimumStamina.plus(Decimal(powerLevel).div(10))
        .times(traitMultiplier)
        .floor();
});