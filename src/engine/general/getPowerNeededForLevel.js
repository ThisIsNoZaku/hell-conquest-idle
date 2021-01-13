import {config} from "../../config";
import {Decimal} from "decimal.js";
import evaluateExpression from "./evaluateExpression";

export default function getPowerNeededForLevel(level) {
    return Decimal(evaluateExpression(config.mechanics.levelToPowerEquation, {
        level: Decimal(level)
    }));
}