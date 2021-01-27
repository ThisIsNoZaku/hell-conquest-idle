import Decimal from "decimal.js";
import {v4} from "node-uuid";
import {HitTypes} from "../../../data/HitTypes";

export function generateHitEvents(hitType, attacker, target, damageToDeal, spentPrecision, spentEvasion, timesUpgraded, timesDowngraded) {
    const hitEventUuid = v4();
    if (HitTypes[hitType].preventHit) {
        return {
            hitType,
            attack: {
                event: "attack",
                uuid: hitEventUuid,
                source: {character: attacker.id},
                target: target.id,
                children: [],
                hitType,
                hit: false,
                precisionUsed: spentPrecision,
                evasionUsed: spentEvasion,
                timesUpgraded,
                timesDowngraded
            }
        }
    } else {
        const damageEventUuid = v4();
        return {
            hitType,
            attack: {
                event: "attack",
                hit: true,
                uuid: hitEventUuid,
                source: {character: attacker.id},
                target: target.id,
                children: [damageEventUuid],
                hitType,
                precisionUsed: spentPrecision,
                evasionUsed: spentEvasion,
                timesUpgraded,
                timesDowngraded
            },
            damage: generateDamageEvent(attacker, target, damageToDeal, hitEventUuid, damageEventUuid)
        }
    }
}

export function generateKillEvent(source, target) {
    return {
        event: "kill",
        source: {character: source.id},
        target: target.id
    }
}

export function generateFatigueDamageEvent(source, target, damage) {
    return {
        uuid: v4(),
        event: "fatigue-damage",
        source: {character: source.id},
        target: target.id,
        value: damage
    }
}

export function generateDamageEvent(sourceCharacter, targetCharacter, damageDone, parentUuid, effectUuid, traitId) {
    effectUuid = effectUuid ? effectUuid : v4();
    return {
        event: "damage",
        uuid: effectUuid,
        target: targetCharacter.id,
        source: {
            character: sourceCharacter.id,
            trait: traitId
        },
        value: Decimal(damageDone),
        parent: parentUuid
    }
}

export function generateStaminaChangeEvent(source, target, value, parent, uuid) {
    uuid = uuid || v4();
    return {
        event: "stamina-change",
        uuid,
        target: target.id,
        source: {character: source.id},
        value,
        parent
    }
}

export function generateRemoveStatusEvent(source, targetCharacter, targetStatusUuid, status, stacks) {
    return {
        event: "remove-status",
        status,
        stacks,
        source: {
            character: source.id
        },
        uuid: v4(),
        target: targetCharacter.id,
        toRemove: targetStatusUuid
    }
}