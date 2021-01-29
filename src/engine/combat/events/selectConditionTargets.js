export default function selectConditionTargets(targetType, sourceCharacter, targetCharacter, combatants) {
    switch (targetType) {
        case "enemy":
        case "any_enemy":
            return Object.values(combatants).filter(c => c.id !== sourceCharacter.id);
        case "self":
            return [sourceCharacter];
        case "target_character":
            return [targetCharacter];
        default:
            throw new Error();
    }
}