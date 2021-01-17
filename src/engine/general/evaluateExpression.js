import {Decimal} from "decimal.js";
import {getConfigurationValue} from "../../config";

export default function evaluateExpression(expression, context) {
    if (expression === null || expression === undefined) {
        return expression;
    }
    context = context || {};
    context.Decimal = Decimal;
    context.config = new Proxy({}, {
        get(target, p, receiver) {
            return getConfigurationValue(p);
        }
    });
    return new Function("context", `with(context) {return ${expression}}`).call(null, context);
}