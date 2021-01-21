export default function selectConditionTargets(targetType, sourceCharacter, targetCharacter, combatants) {
    switch (targetType) {
        case "any_enemy":
        case "all_enemies":
            return Object.values(combatants).filter(c => c.party !== sourceCharacter.party);
        case "source_character":
            return [sourceCharacter];
        case "target_character":
            return [targetCharacter];
        default:
            throw new Error();
    }
}