import calculateActionCost from "./calculateActionCost";
import {debugMessage} from "../../../debugging";
import * as _ from "lodash";

export default function determineCharacterCombatAction(actingCharacter, enemy, enemyAction) {
    debugMessage(`Determining action for '${actingCharacter.id}'`)
    const action = actionDeterminers[actingCharacter.tactics.offensive][actingCharacter.tactics.defensive](actingCharacter, enemy, enemyAction);
    if(action === undefined) {
        return {
            primary: "none",
            enhancements: actingCharacter.defenseEnhancements
        }
    } else {
        return action;
    }
}

const actionDeterminers = {
    overwhelm: {
        none: function (actingCharacter, enemy, enemyAction) {
            const powerAttackEnergyCost = calculateActionCost(actingCharacter, {
                primary: "powerAttack",
                enhancements: actingCharacter.attackEnhancements
            }, enemy);
            if (actingCharacter.combat.stamina.gte(powerAttackEnergyCost)) {
                return {
                    primary: "powerAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
            const basicAttackEnergyCost = calculateActionCost(actingCharacter, {
                primary: "basicAttack",
                enhancements: actingCharacter.attackEnhancements
            }, enemy);
            if (actingCharacter.combat.stamina.gte(basicAttackEnergyCost)) {
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
            return {
                primary: "none",
                enhancements: actingCharacter.attackEnhancements
            }
        },
        block: function (actingCharacter, enemy, enemyAction) {
            if (enemyAction && enemyAction.primary === "dodge") {
                return {
                    primary: "none",
                    enhancements: actingCharacter.defenseEnhancements
                }
            }
            const blockAction = {
                primary: "block",
                enhancements: actingCharacter.defenseEnhancements
            };
            const powerAttackAction = {
                primary: "powerAttack",
                enhancements: actingCharacter.attackEnhancements
            };
            const blockCost = calculateActionCost(actingCharacter, blockAction, enemy);
            if (enemyAction && enemyAction.primary === "powerAttack" && blockCost.lte(actingCharacter.combat.stamina)) {
                return blockAction;
            } else if (calculateActionCost(actingCharacter, powerAttackAction, enemy).lte(actingCharacter.combat.stamina)) {
                return powerAttackAction
            } else {
                return {
                    primary: "none",
                    enhancements: actingCharacter.defenseEnhancements
                }
            }
        },
        dodge: function (actingCharacter, enemy, enemyAction) {
            if (enemyAction && enemyAction.primary === "dodge") {
                return {
                    primary: "none",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
            const enemyCanDodge = enemy.combat.stamina.gte(calculateActionCost(enemy, {
                primary: "dodge",
                enhancements: enemy.defenseEnhancements
            }, actingCharacter));
            const enemyCanPowerAttack = enemy.combat.stamina.gte(calculateActionCost(enemy, {
                primary: "powerAttack",
                enhancements: enemy.attackEnhancements
            }, actingCharacter));
            const canPowerAttack = actingCharacter.combat.stamina.gte(calculateActionCost(actingCharacter, {
                primary: "powerAttack",
                enhancements: actingCharacter.attackEnhancements
            }, actingCharacter));
            if (enemyAction && enemyAction === "powerAttack" || enemyCanPowerAttack) {
                return {
                    primary: "dodge",
                    enhancements: actingCharacter.defenseEnhancements
                }
            } else {
                return {
                    primary: "powerAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
        }
    },
    attrit: {
        none: function (actingCharacter, enemy, enemyAction) {
            const canAttack = calculateActionCost(actingCharacter, {
                primary: "basicAttack",
                enhancements: actingCharacter.attackEnhancements
            }, enemy).lte(actingCharacter.combat.stamina);
            const canBlock = calculateActionCost(actingCharacter, {
                primary: "block",
                enhancements: actingCharacter.attackEnhancements
            }, enemy).lte(actingCharacter.combat.stamina);
            if (canAttack) {
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            } else if (canBlock) {
                return {
                    primary: "block",
                    enhancements: actingCharacter.defenseEnhancements
                }
            }
            return {
                primary: "none",
                enhancements: actingCharacter.defenseEnhancements
            }
        },
        block: function (actingCharacter, enemy, enemyAction) {
            const enemyCanPowerAttack = enemy.combat.stamina.gte(calculateActionCost(enemy, {
                primary: "powerAttack",
                enhancements: enemy.attackEnhancements
            }, actingCharacter));
            if(enemyCanPowerAttack || _.get(enemyAction, "primary") === "powerAttack") {
                return {
                    primary: "block",
                    enhancements: actingCharacter.defenseEnhancements
                }
            }
            const canAttack = calculateActionCost(actingCharacter, {
                primary: "basicAttack",
                enhancements: actingCharacter.attackEnhancements
            }, enemy).lte(actingCharacter.combat.stamina);
            const enemyNotAttacking = ["dodge", "block", "none"].includes(_.get(enemyAction, "primary"));
            if(enemyNotAttacking && canAttack) {
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }


        },
        dodge: function (actingCharacter, enemy, enemyAction) {
            const canPowerAttack = calculateActionCost(enemy, {
                primary: "powerAttack",
                enhancements: []
            }, actingCharacter).lte(actingCharacter.combat.stamina);
            if(_.get(enemyAction, "primary") === "powerAttack" || canPowerAttack) {
                return {
                    primary: "dodge",
                    enhancements: actingCharacter.defenseEnhancements
                }
            }
        }
    },
    counter: {
        none: function (actingCharacter, enemy, enemyAction) {

        },
        block: function (actingCharacter, enemy, enemyAction) {

        },
        dodge: function (actingCharacter, enemy, enemyAction) {

        }
    },
}