import Decimal from "decimal.js";

export default function resolveAttack(tick, attacker, target) {
    if(typeof tick !== "number") {
        throw new Error("Tick not a number");
    }
    // Start at a Solid Hit
    let hitType = "solid";
    let damageToDeal;
    // Can the attacker upgrade their attack?
    if (Decimal(attacker.precisionPoints).gt(target.evasionPoints) && Decimal(attacker.precisionPoints).gte(attacker.attackUpgradeCost)) {
        attacker.precisionPoints = Decimal(attacker.precisionPoints).minus(attacker.attackUpgradeCost);
        hitType = upgradeHitType(hitType);
    }
    if(Decimal(target.evasionPoints).gte(target.incomingAttackDowngradeCost)) {
        target.evasionPoints = Decimal(target.evasionPoints).minus(target.incomingAttackDowngradeCost);
        hitType = downgradeHitType(hitType);
    }
    switch (hitType) {
        case "solid":
            damageToDeal = attacker.damage.med;
            break;
        case "critical":
            damageToDeal = attacker.damage.max;
            break;
        case "glancing":
            damageToDeal = attacker.damage.min;
            break;
    }

    return {
        event: "hit",
        actor: attacker.id,
        targets: [target.id],
        effects: [
            {
                type: "damage",
                source: attacker.id,
                target: target.id,
                value: Decimal(damageToDeal)
            }
        ],
        tick,
        hitType,
    }
}

function upgradeHitType(currentHitType) {
    switch (currentHitType) {
        case "glancing":
            return "solid";
        case "solid":
            return "critical";
        default:
            return currentHitType;
    }
}

function downgradeHitType(currentHitType) {
    switch (currentHitType) {
        case "glancing":
            return "miss";
        case "solid":
            return "glancing";
        case "critical":
            return "solid";
        default:
            return currentHitType;
    }

}