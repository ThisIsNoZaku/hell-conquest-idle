import selectConditionTargets from "./selectConditionTargets";

export default function doesTraitTrigger(eventDefinition, event, thisCharacter) {
    return Object.keys(eventDefinition.conditions || {}).reduce((previousConditionsMet, nextCondition) => {
        let nextConditionMet = false;
        const conditionDefinition = eventDefinition.conditions[nextCondition]
        const targets = selectConditionTargets(conditionDefinition.target, thisCharacter, null, event.combatants);
        switch (nextCondition) {
            case "health_percentage":
                switch (conditionDefinition.target) {
                    case "any_enemy":
                        nextConditionMet = targets.some(nextTarget => {
                            const healthPercentage = nextTarget.hp.div(nextTarget.maximumHp);
                            return healthPercentage.times(100).lte(conditionDefinition.below);
                        });
                        break;
                    case "all_enemies":
                        nextConditionMet = targets.every(nextTarget => {
                            const healthPercentage = nextTarget.hp.div(nextTarget.maximumHp);
                            return healthPercentage.lte(conditionDefinition[nextCondition].below);
                        });
                        break;
                }

                break;
        }
        return nextConditionMet && previousConditionsMet;
    }, true);
}