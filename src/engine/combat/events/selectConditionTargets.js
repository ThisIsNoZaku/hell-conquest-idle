export default function selectConditionTargets(targetType, sourceCharacter, blahblah, combatants) { // FIXMe: Remove third parameter
    switch (targetType) {
        case "enemy":
        case "any_enemy":
        case "target_character":
            return Object.values(combatants).filter(c => c.id !== sourceCharacter.id);
        case "self":
            return [sourceCharacter];
        default:
            throw new Error();
    }
}