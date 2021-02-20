import triggerEvent from "../../general/triggerEvent";

export default function onTakingDamage(damagedCharacter, attackingCharacter, attack, damage, roundEvents) {
    triggerEvent({
        type: `on_taking_damage`,
        source: {
            character: damagedCharacter,
            event: damage
        },
        target: attackingCharacter,
        combatants: {
            [attackingCharacter.id]: attackingCharacter,
            [damagedCharacter.id]: damagedCharacter
        },
        roundEvents
    });
}