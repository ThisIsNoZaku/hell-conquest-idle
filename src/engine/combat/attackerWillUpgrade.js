import {Tactics} from "../../data/Tactics";
import {HitTypes} from "../../data/HitTypes";
import {getConfigurationValue} from "../../config";

export default function attackerWillUpgrade(attacker, defender, upgradeCost, currentHitLevel, timesUpgraded) {
    const totalUpgradeCost = upgradeCost.times(timesUpgraded + 1);
    const attackerHasMoreStamina = attacker.combat.stamina.minus(totalUpgradeCost).gt(defender.combat.stamina);
    const attackerWantsTo = Tactics[attacker.tactics].strategy.attack === "always" ||
        attackerHasMoreStamina;
    return totalUpgradeCost.lte(attacker.combat.stamina) &&
        ((currentHitLevel !== HitTypes.max && attackerWantsTo && timesUpgraded < getConfigurationValue("maximum_upgrade_times")) ||
            (attacker.combat.stamina.eq(attacker.combat.maximumStamina) && timesUpgraded === 0));
}