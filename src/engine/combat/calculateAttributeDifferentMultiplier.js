import Decimal from "decimal.js";
import {getConfigurationValue} from "../../config";
import * as lerp from "lerp";

export default function calculateAttributeDifferentMultiplier(a, b) {
    const multipliers = getConfigurationValue("mechanics.combat.attributeDifferenceMultipliers");
    const base = Decimal.min(5, Decimal.max(-5, Decimal(a).minus(b)));
    const roundedDown = base.floor();
    const roundedUp = base.ceil();
    const remainder = Math.abs(multipliers[roundedDown.toNumber()] - multipliers[roundedUp.toNumber()]);
    const multiplier = Decimal(lerp(multipliers[roundedDown.toNumber()], multipliers[roundedUp.toNumber()], remainder))
        .times(100).floor().div(100);
    return multiplier;
}