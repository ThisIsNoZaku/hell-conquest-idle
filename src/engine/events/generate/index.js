import Decimal from "decimal.js";
import {v4} from "node-uuid";
import {HitTypes} from "../../../data/HitTypes";

function linkEvents(parent, child) {
    parent.children = [...parent.children || [], child.uuid];
    child.parent = parent.uuid;
}

export function generateAttackEvent(hitType, attacker, target, didHit, action, actionEnergyCost, reaction, reactionEnergyCost) {
    return {
        event: "attack",
        uuid: v4(),
        source: {
            character: attacker.id,
        },
        target: target.id,
        children: [],
        hitType,
        hit: didHit,
        action,
        actionEnergyCost,
        reaction,
        reactionEnergyCost
    }
}

export function generateHitEvents(hitType, attacker, target, damageToDeal, damageType, action, actionEnergyCost, reaction, reactionEnergyCost) {
    const attack = generateAttackEvent(hitType, attacker, target, !HitTypes[hitType].preventHit, action, actionEnergyCost, reaction, reactionEnergyCost);
    let damage;
    if (!HitTypes[hitType].preventHit) {
        damage = generateDamageEvent(attacker, target, damageToDeal, damageType)
        linkEvents(attack, damage);
    }
    return {
        hitType,
        attack,
        damage
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

export function generateDamageEvent(sourceCharacter, targetCharacter, damageDone, damageType, sourceType, sourceId) {
    return {
        event: "damage",
        uuid: v4(),
        target: targetCharacter.id,
        source: {
            character: sourceCharacter.id,
            [sourceType]: sourceId
        },
        value: Decimal(damageDone),
        type: damageType
    }
}

export function generateStaminaChangeEvent(source, target, value, parent, sourceType, sourceId, uuid) {
    uuid = uuid || v4();
    return {
        event: "stamina-change",
        uuid,
        target: target.id,
        source: {
            character: source.id,
            [sourceType]: sourceId
        },
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

export function generateActionSkipEvent(character, tick, reason) {
    return {
        uuid: v4(),
        event: "action-skipped",
        source: {
            character: character.id
        },
        reason,
        tick
    }
}

export function generateHealthChangeEvent(source, target, value, parent, uuid, sourceType, sourceId) {
    uuid = uuid || v4();
    return {
        event: "health-change",
        uuid,
        target: target.id,
        source: {
            character: source.id,
            [sourceType]: sourceId
        },
        value,
        parent
    }
}