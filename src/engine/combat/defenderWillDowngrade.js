import {HitTypes} from "../../data/HitTypes";
import {Tactics} from "../../data/Tactics";
import {getConfigurationValue} from "../../config";

export default function defenderWillDowngrade(attacker, defender, downgradeCost, currentHitLevel, timesDowngraded) {
    const totalDowngradeCost = downgradeCost.times(timesDowngraded + 1) ;
    const defenderHasMoreStamina = defender.combat.stamina.gt(attacker.combat.stamina);
    const hitIsCurrentlyMaxLevel = currentHitLevel === HitTypes.max;
    const defenderWantsTo = Tactics[defender.tactics].strategy.defend === "always" ||
        (Tactics[defender.tactics].strategy.defend === "upgraded" && hitIsCurrentlyMaxLevel) ||
        (Tactics[defender.tactics].strategy.defend === "advantage" && defenderHasMoreStamina) ||
        defender.hp.lt(attacker.hp);
    return totalDowngradeCost.lte(defender.combat.stamina) && currentHitLevel !== HitTypes.min && defenderWantsTo &&
        timesDowngraded < getConfigurationValue("maximum_downgrade_times");
}