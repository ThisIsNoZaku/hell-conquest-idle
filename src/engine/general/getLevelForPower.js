import {config, getConfigurationValue} from "../../config";
import {Decimal} from "decimal.js";
import evaluateExpression from "./evaluateExpression";
import * as _ from "lodash";

export default _.memoize(internalGetLevelForPower);

function internalGetLevelForPower(powerPoints) {
    return Decimal(evaluateExpression(getConfigurationValue("mechanics.powerToLevelEquation"), {
        powerPoints: Decimal(powerPoints)
    }));
}