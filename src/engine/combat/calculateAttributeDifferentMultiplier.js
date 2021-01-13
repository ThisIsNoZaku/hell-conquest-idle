import Decimal from "decimal.js";
import { config } from "../../config";

export default function calculateAttributeDifferentMultiplier(a, b) {
    Decimal.set({rounding: Decimal.ROUND_DOWN});
    const normalized = Decimal(a).minus(b).round();
    return config.mechanics.combat.attributeDifferenceMultipliers[normalized];
}