import Decimal from "decimal.js";
import { v4 } from "node-uuid";

export function generateHitEvents(hitType, attacker, target, damageToDeal, spentPrecision, spentEvasion, timesUpgraded, timesDowngraded) {
    const damageEventUuid = v4();
    const hitEventUuid = v4();
    return {
        hitType,
        effects: [
            {
                event: "hit",
                uuid: hitEventUuid,
                source: attacker.id,
                target: target.id,
                children: [damageEventUuid],
                hitType,
                precisionUsed: spentPrecision,
                evasionUsed: spentEvasion,
                timesUpgraded,
                timesDowngraded
            },
            {
                event: "damage",
                uuid: damageEventUuid,
                parent: hitEventUuid,
                source: attacker.id,
                target: target.id,
                value: Decimal(damageToDeal)
            }
        ]
    }
}