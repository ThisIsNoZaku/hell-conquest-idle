import Decimal from "decimal.js";
import {Tactics} from "../../data/Tactics";
import {generateHitEvents} from "../events/generate";
import { config } from "../../config";
import {HitTypes} from "../../data/HitTypes";

export default function resolveAttack(tick, attacker, target) {
    if (typeof tick !== "number") {
        throw new Error("Tick not a number");
    }
    // Start at a Solid Hit
    let hitLevel = config.mechanics.combat.startingHitLevel;
    let spentPrecision = 0;
    let spentEvasion = 0;
    // Can the attacker upgrade their attack?
    let timesUpgraded = 0;
    const attackUpgradeCost = attacker.attackUpgradeCost;
    const maxHitLevel = HitTypes.max;
    while (Decimal(attacker.precisionPoints).gt(target.evasionPoints.times(1 + timesUpgraded))
        && Decimal(attacker.precisionPoints).gte(attackUpgradeCost.times(1 + timesUpgraded))
        && hitLevel != maxHitLevel
        ) {
        attacker.precisionPoints = Decimal(attacker.precisionPoints).minus(attacker.attackUpgradeCost.times(1 + timesUpgraded));
        spentPrecision = attacker.attackUpgradeCost;
        hitLevel++;
        timesUpgraded++;
    }
    let timesDowngraded = 0;
    const minHitLevel = HitTypes.min;
    const attackDowngradeCost = Tactics[target.tactics].modifiers.downgradeCostSameAsUpgrade ? attackUpgradeCost : target.incomingAttackDowngradeCost;
    while (Decimal(target.evasionPoints).gte(attackDowngradeCost.times(1 + timesDowngraded)) &&
            hitLevel != minHitLevel) {
        target.evasionPoints = Decimal(target.evasionPoints).minus(attackDowngradeCost.times(1 + timesDowngraded));
        spentEvasion = attackDowngradeCost;
        if(Tactics[target.tactics].modifiers.always_downgrade_to_glancing) {
            hitLevel -= 2;
            timesDowngraded += 2;
        } else {
            hitLevel--;
            timesDowngraded++;
        }
    }
    const damageToDeal = Decimal(attacker.damage[hitLevel]).floor();

    target.hp = Decimal.max(target.hp.minus(damageToDeal), 0);
    const resultEvents = generateHitEvents(hitLevel, attacker, target, damageToDeal, spentPrecision, spentEvasion, timesUpgraded, timesDowngraded);
    return resultEvents;
}