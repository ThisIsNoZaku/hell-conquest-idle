import {Decimal} from "decimal.js";
import {getConfigurationValue} from "../../config";
import {getGlobalState} from "../index";

const expressionCache = {};

export default function evaluateExpression(expression, context) {
    if (expression === null || expression === undefined) {
        return expression;
    }
    if (!expressionCache[expression]) {
        expressionCache[expression] = new Function("context", `with(context) {return ${expression}}`);
    }
    context.Decimal = Decimal;
    context.config = new Proxy({}, {
        get(target, p, receiver) {
            return getConfigurationValue(p);
        }
    });
    return expressionCache[expression].call(null, context);
}