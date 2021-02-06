import calculateActionCost from "./calculateActionCost";
import {debugMessage} from "../../../debugging";
import * as _ from "lodash";

const doNothing = (actingCharacter) => {
    return {
        primary: "none",
        enhancements: actingCharacter.defenseEnhancements
    }
}

export default function determineCharacterCombatAction(actingCharacter, enemy, enemyAction) {
    debugMessage(`Determining action for '${actingCharacter.id}'. Enemy is performing '${_.get(enemyAction, "primary", "unknown")}'`);
    const action = actionDeterminers[actingCharacter.tactics.offensive][actingCharacter.tactics.defensive](actingCharacter, enemy, enemyAction);
    debugMessage(`Selected action ${_.get(action, "primary")}`);
    if(action === undefined || calculateActionCost(actingCharacter, action, enemy).gt(actingCharacter.combat.stamina)) {
        return doNothing(actingCharacter);
    } else {
        return action;
    }
}

const actionDeterminers = { // TODO: Refactor? Maybe lookup table for combinations of actual/possible combinations.
    overwhelm: {
        none: function (actingCharacter, enemy, enemyAction) {
            const powerAttackEnergyCost = calculateActionCost(actingCharacter, {
                primary: "powerAttack",
                enhancements: actingCharacter.attackEnhancements
            }, enemy);
            if (actingCharacter.combat.stamina.gte(powerAttackEnergyCost)) {
                debugMessage(`Reason: Acting character can afford power attack`);
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
                debugMessage(`Reason: Acting character can afford basic attack`);
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
                debugMessage(`Reason: Enemy is dodging`);
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
            const enemyCanPowerAttack = calculateActionCost(enemy, {
                primary: "powerAttack",
                enhancements: enemy.attackEnhancements
            }, actingCharacter).lte(enemy.combat.stamina);
            const blockCost = calculateActionCost(actingCharacter, blockAction, enemy);
            if (((enemyAction && enemyAction.primary === "powerAttack") || (!enemyAction && enemyCanPowerAttack)) && blockCost.lte(actingCharacter.combat.stamina)) {
                debugMessage(`Reason: Enemy is power attacking and character can block`);
                return blockAction;
            } else if (calculateActionCost(actingCharacter, powerAttackAction, enemy).lte(actingCharacter.combat.stamina)) {
                debugMessage(`Reason: Acting character can power attack and enemy NOT power attacking`);
                return powerAttackAction
            }
        },
        dodge: function (actingCharacter, enemy, enemyAction) {
            if (enemyAction && enemyAction.primary === "dodge") {
                return
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
                debugMessage(`Reason: Enemy is or can power attack`);
                return {
                    primary: "dodge",
                    enhancements: actingCharacter.defenseEnhancements
                }
            } else {
                debugMessage(`Reason: Enemy not power attacking.`);
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
                debugMessage(`Reason: Character can perform basic attack.`);
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            } else if (canBlock) {
                debugMessage(`Reason: Character cannot attack but can block`);
                return {
                    primary: "block",
                    enhancements: actingCharacter.defenseEnhancements
                }
            }
        },
        block: function (actingCharacter, enemy, enemyAction) {
            const enemyCanPowerAttack = enemy.combat.stamina.gte(calculateActionCost(enemy, {
                primary: "powerAttack",
                enhancements: enemy.attackEnhancements
            }, actingCharacter));
            if(enemyCanPowerAttack || _.get(enemyAction, "primary") === "powerAttack") {
                debugMessage(`Reason: Enemy is/can power attack.`);
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
                debugMessage(`Reason: Enemy not attacking and player can attack.`);
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
        },
        dodge: function (actingCharacter, enemy, enemyAction) {
            const enemyCanPowerAttack = calculateActionCost(enemy, {
                primary: "powerAttack",
                enhancements: []
            }, actingCharacter).lte(actingCharacter.combat.stamina);
            if(_.get(enemyAction, "primary") === "powerAttack" || enemyCanPowerAttack) {
                debugMessage(`Reason: Enemy is power attacking`);
                return {
                    primary: "dodge",
                    enhancements: actingCharacter.defenseEnhancements
                }
            } else {

            }
        }
    },
    counter: {
        none: function (actingCharacter, enemy, enemyAction) {
            const enemyCanBasicAttack = calculateActionCost(enemy, {
                primary: "basicAttack",
                enhancements: enemy.defenseEnhancements
            }).lte(enemy.combat.stamina);
            const enemyCanPowerAttack = calculateActionCost(enemy, {
                primary: "powerAttack",
                enhancements: enemy.defenseEnhancements
            }).lte(enemy.combat.stamina)
            if(["basicAttack", "powerAttack", "none"].includes(_.get(enemyAction, "primary"))) {
                return {
                    primary: "powerAttack",
                    enhancements: actingCharacter.defenseEnhancements
                }
            }
            const enemyCanBlock = calculateActionCost(enemy, {
                primary: "block",
                enhancements: enemy.defenseEnhancements
            }).lte(enemy.combat.stamina);
            const enemyCanDodge = calculateActionCost(enemy, {
                primary: "dodge",
                enhancements: enemy.defenseEnhancements
            }).lte(enemy.combat.stamina);
            if(!enemyCanBlock && !enemyCanDodge) {
                return {
                    primary: "powerAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
            if((enemyAction && enemyAction.primary === "block") || enemyCanBlock) {
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
        },
        block: function (actingCharacter, enemy, enemyAction) {
            const enemyCanBasicAttack = calculateActionCost(enemy, {
                primary: "basicAttack",
                enhancements: enemy.defenseEnhancements
            }).lte(enemy.combat.stamina);
            const enemyCanPowerAttack = calculateActionCost(enemy, {
                primary: "powerAttack",
                enhancements: enemy.defenseEnhancements
            }).lte(enemy.combat.stamina)
            if(enemyCanPowerAttack || ["powerAttack"].includes(_.get(enemyAction, "primary"))) {
                return {
                    primary: "block",
                    enhancements: actingCharacter.defenseEnhancements
                }
            }
            if(["dodge", "block"].includes(_.get(enemyAction, "primary"))) {
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
            const enemyCanBlock = calculateActionCost(enemy, {
                primary: "block",
                enhancements: enemy.defenseEnhancements
            }).lte(enemy.combat.stamina);
            const enemyCanDodge = calculateActionCost(enemy, {
                primary: "dodge",
                enhancements: enemy.defenseEnhancements
            }).lte(enemy.combat.stamina);
            if(!enemyCanBlock && !enemyCanDodge) {
                return {
                    primary: "powerAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
            if(((enemyAction && enemyAction.primary === "block") || enemyCanBlock) && !enemyCanPowerAttack) {
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
        },
        dodge: function (actingCharacter, enemy, enemyAction) {
            const enemyCanBasicAttack = calculateActionCost(enemy, {
                primary: "basicAttack",
                enhancements: enemy.defenseEnhancements
            }).lte(enemy.combat.stamina);
            const enemyCanPowerAttack = calculateActionCost(enemy, {
                primary: "powerAttack",
                enhancements: enemy.defenseEnhancements
            }).lte(enemy.combat.stamina)
            if(enemyCanPowerAttack || enemyCanBasicAttack || ["basicAttack", "powerAttack"].includes(_.get(enemyAction, "primary"))) {
                return {
                    primary: "dodge",
                    enhancements: actingCharacter.defenseEnhancements
                }
            }
            const enemyCanBlock = calculateActionCost(enemy, {
                primary: "block",
                enhancements: enemy.defenseEnhancements
            }).lte(enemy.combat.stamina);
            const enemyCanDodge = calculateActionCost(enemy, {
                primary: "dodge",
                enhancements: enemy.defenseEnhancements
            }).lte(enemy.combat.stamina);
            if(!enemyCanBlock && !enemyCanDodge) {
                return {
                    primary: "powerAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
            if((enemyAction && enemyAction.primary === "block") || enemyCanBlock) {
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
        }
    },
}