import Decimal from "decimal.js";
import {getConfigurationValue} from "../../config";

export default function calculateAttributeDifferentMultiplier(a, b) {
    Decimal.set({rounding: Decimal.ROUND_DOWN});
    const normalized = Decimal(a).minus(b).round();
    return getConfigurationValue("mechanics.combat.attributeDifferenceMultipliers")[normalized];
}