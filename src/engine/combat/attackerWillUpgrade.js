import {Tactics} from "../../data/Tactics";
import {HitTypes} from "../../data/HitTypes";
import {getConfigurationValue} from "../../config";

export default function attackerWillUpgrade(attacker, defender, upgradeCost, currentHitLevel, timesUpgraded) {
    const attackerHasMoreStamina = attacker.combat.stamina.gt(defender.combat.stamina);
    const attackerWantsTo = Tactics[attacker.tactics].strategy.attack === "always" ||
        attackerHasMoreStamina;
    return upgradeCost.lte(attacker.combat.stamina) && currentHitLevel !== HitTypes.max &&
        attackerWantsTo && timesUpgraded < getConfigurationValue("maximum_upgrade_times");
}