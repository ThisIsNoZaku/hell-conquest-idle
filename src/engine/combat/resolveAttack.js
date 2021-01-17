import Decimal from "decimal.js";
import {Tactics} from "../../data/Tactics";
import {generateHitEvents} from "../events/generate";
import {getConfigurationValue} from "../../config";
import {HitTypes} from "../../data/HitTypes";
import calculateDamageBy from "./calculateDamageBy";
import {debugMessage} from "../../debugging";

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
    const attackUpgradeCost = attacker.combat.attackUpgradeCost;
    const maxHitLevel = HitTypes.max;
    debugMessage(`Attacker precision ${Decimal(attacker.combat.precisionPoints).toFixed()} > target evasion ${Decimal(target.combat.evasionPoints).times(1 + timesUpgraded).toFixed()}`);
    while (Decimal(attacker.combat.precisionPoints).gt(Decimal(target.combat.evasionPoints).times(1 + timesUpgraded).plus(spentPrecision))
        && Decimal(attacker.combat.precisionPoints).gte(Decimal(attackUpgradeCost).times(1 + timesUpgraded))
        && hitLevel != maxHitLevel
        && timesUpgraded === 0
        ) {
        spentPrecision = spentPrecision.plus(attackUpgradeCost.times(1 + timesUpgraded));

        hitLevel++;
        timesUpgraded++;
    }
    attacker.combat.precisionPoints = Decimal(attacker.combat.precisionPoints).minus(spentPrecision);
    debugMessage(`Precision points for ${attacker.id} now ${Decimal(attacker.combat.precisionPoints).toFixed()}`);

    let timesDowngraded = 0;
    const minHitLevel = HitTypes.min;
    const attackDowngradeCost = Tactics[target.tactics].modifiers.downgradeCostSameAsUpgrade ? attackUpgradeCost : target.combat.incomingAttackDowngradeCost;
    debugMessage(`Attacker precision ${Decimal(attacker.combat.precisionPoints).toFixed()} > target evasion ${Decimal(target.combat.evasionPoints).times(1 + timesUpgraded).toFixed()}`);
    while (Decimal(target.combat.evasionPoints).gte(attackDowngradeCost.times(1 + timesDowngraded).plus(spentEvasion)) &&
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
    target.combat.evasionPoints = Decimal(target.combat.evasionPoints).minus(spentEvasion);
    debugMessage(`Evasion points for ${target.id} now ${target.combat.evasionPoints.toFixed()}`);
    if(target.combat.evasionPoints.lt(0) || attacker.combat.precisionPoints.lt(0)) {
        debugger;
    }
    const damageToDeal = calculatedDamage[hitLevel].floor();

    target.setHp(Decimal.max(Decimal(target.hp).minus(damageToDeal), 0));
    const resultEvents = generateHitEvents(hitLevel, attacker, target, damageToDeal, spentPrecision, spentEvasion, timesUpgraded, timesDowngraded);
    return resultEvents;
}