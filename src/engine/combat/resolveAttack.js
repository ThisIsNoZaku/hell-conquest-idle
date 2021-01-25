import Decimal from "decimal.js";
import {Tactics} from "../../data/Tactics";
import {generateHitEvents} from "../events/generate";
import {getConfigurationValue} from "../../config";
import {HitTypes} from "../../data/HitTypes";
import calculateDamageBy from "./calculateDamageBy";
import {debugMessage} from "../../debugging";
import calculateAttackUpgradeCost from "./calculateAttackUpgradeCost";
import calculateAttackDowngradeCost from "./calculateAttackDowngradeCost";
import attackerWillUpgrade from "./attackerWillUpgrade";
import defenderWillDowngrade from "./defenderWillDowngrade";

export default function resolveAttack(tick, attacker, target) {
    if (typeof tick !== "number") {
        throw new Error("Tick not a number");
    }
    // Calculate the damage of the attack
    const calculatedDamage = calculateDamageBy(attacker).against(target);
    // Start at a Solid Hit
    let hitLevel = getConfigurationValue("mechanics.combat.startingHitLevel");
    let spentPrecision = Decimal(0);
    let spentEvasion = Decimal(0);
    // Can the attacker upgrade their attack?
    let timesUpgraded = 0;

    const attackUpgradeCost = calculateAttackUpgradeCost(attacker, target);
    while (attackerWillUpgrade(attacker, target, Decimal(attackUpgradeCost), hitLevel, timesUpgraded)) {
        hitLevel++;
        timesUpgraded++;
    }
    spentPrecision = attackUpgradeCost.times(timesUpgraded);
    attacker.combat.stamina = Decimal(attacker.combat.stamina).minus(spentPrecision);

    let timesDowngraded = 0;
    const attackDowngradeCost = calculateAttackDowngradeCost(target, attacker);

    while (defenderWillDowngrade(attacker, target, Decimal(attackDowngradeCost), hitLevel, timesDowngraded)) {
        if (Tactics[target.tactics].modifiers.downgrade_devastating_to_miss && HitTypes.max === hitLevel) {
            timesDowngraded = 1;
            hitLevel = -1;
        } else {
            hitLevel--;
            timesDowngraded++;
        }
    }
    spentEvasion = attackDowngradeCost.times(timesDowngraded);
    target.combat.stamina = Decimal(target.combat.stamina).minus(spentEvasion);

    const damageToDeal = calculatedDamage[hitLevel].floor();

    target.setHp(Decimal.max(Decimal(target.hp).minus(damageToDeal), 0));
    const resultEvents = generateHitEvents(hitLevel, attacker, target, damageToDeal, spentPrecision, spentEvasion, timesUpgraded, timesDowngraded);
    return resultEvents;
}