import {getConfigurationValue} from "../../config";
import * as _ from "lodash";
import {Decimal} from "decimal.js";
import {Traits} from "../../data/Traits";
import evaluateExpression from "./evaluateExpression";

export default _.memoize(function (powerLevel, traits) {
    const minimumStamina = Decimal(getConfigurationValue("minimum_stamina"));
    const traitMultiplier = Object.keys(traits).reduce((total, trait) => {
        const staminaModifier = _.get(Traits, [trait, "continuous", "trigger_effects", "maximum_stamina_modifier"]);
        if(_.get(staminaModifier, "target") === "self") {
            const modifier = evaluateExpression(staminaModifier.value, {
                tier: Decimal(traits[trait])
            });
            return total.plus(modifier);
        }
        return total;
    }, Decimal(1));
    return minimumStamina.plus(Decimal(powerLevel).times(100)) // FIXME: Configure energy per level.
        .times(traitMultiplier)
        .floor();
});