import Decimal from "decimal.js";
import {Tactics} from "../../data/Tactics";
import {generateHitEvents} from "../events/generate";
import {getConfigurationValue} from "../../config";
import {HitTypes} from "../../data/HitTypes";
import calculateDamageBy from "./calculateDamageBy";
import {debugMessage} from "../../debugging";
import calculateAttackUpgradeCost from "./calculateAttackUpgradeCost";
import calculateAttackDowngradeCost from "./calculateAttackDowngradeCost";

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
    let attackerStaminaPercentage = attacker.combat.stamina.div(attacker.combat.maximumStamina);
    const attackUpgradeCost = calculateAttackUpgradeCost(attacker, target);
    const maxHitLevel = HitTypes.max;
    while (Decimal(attacker.combat.stamina).gte(Decimal(attackUpgradeCost).times(1 + timesUpgraded))
        && hitLevel != maxHitLevel
        && timesUpgraded === 0 &&
        attackerStaminaPercentage.gt(Tactics[attacker.tactics].strategy.attack_floor)
        ) {
        spentPrecision = spentPrecision.plus(attackUpgradeCost.times(1 + timesUpgraded));

        hitLevel++;timesUpgraded++;
    }
    attacker.combat.stamina = Decimal(attacker.combat.stamina).minus(spentPrecision);

    let timesDowngraded = 0;
    const minHitLevel = HitTypes.min;
    const attackDowngradeCost = calculateAttackDowngradeCost(target, attacker);

    while (Decimal(target.combat.stamina).gte(attackDowngradeCost.times(1 + timesDowngraded).plus(spentEvasion)) &&
    hitLevel != minHitLevel && timesDowngraded === 0) {
        spentEvasion = spentEvasion.plus(attackDowngradeCost.times(1 + timesDowngraded));
        if (Tactics[target.tactics].modifiers.always_downgrade_to_glancing) {
            timesDowngraded = hitLevel + 1;
            hitLevel = -1;
        } else {
            hitLevel--;
            timesDowngraded++;
        }
    }
    target.combat.stamina = Decimal(target.combat.stamina).minus(spentEvasion);

    const damageToDeal = calculatedDamage[hitLevel].floor();

    target.setHp(Decimal.max(Decimal(target.hp).minus(damageToDeal), 0));
    const resultEvents = generateHitEvents(hitLevel, attacker, target, damageToDeal, spentPrecision, spentEvasion, timesUpgraded, timesDowngraded);
    return resultEvents;
}