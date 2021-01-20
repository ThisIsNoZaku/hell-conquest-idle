import Decimal from "decimal.js";
import { v4 } from "node-uuid";
import {HitTypes} from "../../../data/HitTypes";

export function generateHitEvents(hitType, attacker, target, damageToDeal, spentPrecision, spentEvasion, timesUpgraded, timesDowngraded) {
    const hitEventUuid = v4();
    if(HitTypes[hitType].preventHit) {
        return {
            hitType,
            effects: [
                {
                    event: "attack",
                    uuid: hitEventUuid,
                    source: attacker.id,
                    target: target.id,
                    children: [],
                    hitType,
                    hit: false,
                    precisionUsed: spentPrecision,
                    evasionUsed: spentEvasion,
                    timesUpgraded,
                    timesDowngraded
                }
            ]
        }
    } else {
        const damageEventUuid = v4();
        return {
            hitType,
            effects: [
                {
                    event: "attack",
                    hit: true,
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
}