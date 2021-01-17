import {getConfigurationValue} from "../../config";
import * as _ from "lodash";
import {Decimal} from "decimal.js";

export default _.memoize(function (powerLevel) {
    const minimumStamina = Decimal(getConfigurationValue("minimum_stamina"));
    return minimumStamina.plus(Decimal(powerLevel).div(10)).floor();
});