import {Decimal} from "decimal.js";
import {config} from "../../config";

const expressionCache = {};

export default function evaluateExpression(expression, context) {
    if (expression === null || expression === undefined) {
        return expression;
    }
    if (!expressionCache[expression]) {
        expressionCache[expression] = new Function("context", `with(context) {return ${expression}}`);
    }
    context.Decimal = Decimal;
    context.config = config;
    return expressionCache[expression].call(null, context);
}