import {calculateActionCost} from "./calculateActionCost";
import {debugMessage} from "../../../debugging";
import * as _ from "lodash";
import {CombatActions} from "../../../data/CombatActions";
import {act} from "@testing-library/react";

const doNothing = (actingCharacter) => {
    return {
        primary: "none",
        enhancements: actingCharacter.defenseEnhancements
    }
}

const attackPrevented = (actingCharacter) => {
    return {
        primary: "none",
        enhancements: actingCharacter.defenseEnhancements,
        blocked: true
    }
}

export default function determineCharacterCombatAction(actingCharacter, enemy, enemyAction) {
    debugMessage(`Determining action for '${actingCharacter.id}' with tactics ${actingCharacter.tactics.offensive}-${actingCharacter.tactics.defensive}'. Enemy is performing '${_.get(enemyAction, "primary", "unknown")}'`);
    if(!enemy.canBeAttacked) {
        return attackPrevented(actingCharacter);
    }
    const action = actionDeterminers[actingCharacter.tactics.offensive][actingCharacter.tactics.defensive](actingCharacter, enemy,
        enemy.isInscrutable ? null : enemyAction);
    debugMessage(`Selected action ${_.get(action, "primary")}`);
    if(action === undefined) {
        debugMessage("Action changed to 'none'");
        return doNothing(actingCharacter);
    } else if (calculateActionCost(actingCharacter, action, enemy).gt(actingCharacter.combat.stamina)) {
        debugMessage("Cannot afford to act, changing to 'none'");
        return doNothing(actingCharacter);
    } else {
        return action;
    }
}

const actionDeterminers = { // TODO: Refactor? Maybe lookup table for combinations of actual/possible combinations.
    overwhelm: {
        none: function (actingCharacter, enemy, enemyAction) {
            if(actingCharacter.combat.stamina.eq(actingCharacter.combat.maximumStamina)) {
                return {
                    primary: "powerAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
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
                debugMessage(`Reason: Acting character can afford basic attack but not power attack.`);
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
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
            const canPowerAttack = calculateActionCost(actingCharacter, powerAttackAction, enemy).lte(actingCharacter.combat.stamina);
            const enemyCanPowerAttack = calculateActionCost(enemy, {
                primary: "powerAttack",
                enhancements: enemy.attackEnhancements
            }, actingCharacter).lte(enemy.combat.stamina);
            const blockCost = calculateActionCost(actingCharacter, blockAction, enemy);
            if (((enemyAction && enemyAction.primary === "powerAttack") || (!enemyAction && enemyCanPowerAttack)) && blockCost.lte(actingCharacter.combat.stamina)) {
                debugMessage(`Reason: Enemy is power attacking or can power attack and character can block`);
                return blockAction;
            } else if(canPowerAttack && actingCharacter.combat.stamina.eq(actingCharacter.combat.maximumStamina)) {
                debugMessage(`Reason: At max stamina and enemy not power attacking.`);
                return {
                    primary: "powerAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            } else if (calculateActionCost(actingCharacter, powerAttackAction, enemy).lte(actingCharacter.combat.stamina)) {
                debugMessage(`Reason: Acting character can power attack and enemy NOT power attacking`);
                return powerAttackAction
            } else if(["basicAttack", "powerAttack"].includes(_.get(enemyAction, "primary")) && !canPowerAttack) {
                return {
                    primary: "block",
                    enhancements: actingCharacter.attackEnhancements
                }
            } else if(calculateActionCost(actingCharacter, {
                primary: "block",
                enhancements: actingCharacter.defenseEnhancements
            }, enemy).lte(actingCharacter.combat.stamina)) {
                return {
                    primary: "block",
                    enhancements: actingCharacter.defenseEnhancements
                }
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
            if ((enemyAction && enemyAction === "powerAttack") || (enemyCanPowerAttack && !enemyAction)) {
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
            if(canAttack && actingCharacter.combat.stamina.eq(actingCharacter.combat.maximumStamina))  {
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
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
            if((!enemyAction && enemyCanPowerAttack) || _.get(enemyAction, "primary") === "powerAttack" || _.get(enemyAction, "primary") === "basicAttack") {
                debugMessage(`Reason: Enemy can power attack or is power attacking.`);
                return {
                    primary: "block",
                    enhancements: actingCharacter.defenseEnhancements
                }
            }
            const canAttack = calculateActionCost(actingCharacter, {
                primary: "basicAttack",
                enhancements: actingCharacter.attackEnhancements
            }, enemy).lte(actingCharacter.combat.stamina);
            const enemyCanAttack = calculateActionCost(enemy, {
                primary: "basicAttack",
                enhancements: actingCharacter.attackEnhancements
            }, actingCharacter).lte(enemy.combat.stamina)
            const enemyNotAttacking = defenseActions.includes(_.get(enemyAction, "primary"));
            if((enemyNotAttacking || !enemyCanAttack) && canAttack) {
                debugMessage(`Reason: Enemy can't attack and player can.`);
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
            if(_.get(enemyAction, "primary") === "powerAttack" || (enemyCanPowerAttack && !enemyAction)) {
                debugMessage(`Reason: Enemy is power attacking`);
                return {
                    primary: "dodge",
                    enhancements: actingCharacter.defenseEnhancements
                }
            }
            if(actingCharacter.combat.stamina.eq(actingCharacter.combat.maximumStamina) ||
                defenseActions.includes(_.get(enemyAction, "primary"))) {
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
        }
    },
    counter: {
        none: function (actingCharacter, enemy, enemyAction) {
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
            if((!enemyAction && !enemyCanBlock && !enemyCanDodge) || (enemyAction && !["dodge", "block"].includes(enemyAction.primary))) {
                debugMessage("Reason: enemy cannot block or dodge");
                return {
                    primary: "powerAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
            if((enemyAction && enemyAction.primary === "block") || enemyCanBlock) {
                debugMessage("Reason: enemy is blocking or can block");
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
            if(actingCharacter.combat.stamina.eq(actingCharacter.combat.maximumStamina)) {
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
        },
        block: function (actingCharacter, enemy, enemyAction) {
            if(actingCharacter.combat.stamina.eq(actingCharacter.combat.maximumStamina)) {
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
            const enemyCanPowerAttack = calculateActionCost(enemy, {
                primary: "powerAttack",
                enhancements: enemy.defenseEnhancements
            }).lte(enemy.combat.stamina)
            if((!enemyAction && enemyCanPowerAttack) || ["powerAttack"].includes(_.get(enemyAction, "primary"))) {
                debugMessage("Reason: enemy can power attack or is power attacking.");
                return {
                    primary: "block",
                    enhancements: actingCharacter.defenseEnhancements
                }
            }
            if(["dodge", "block"].includes(_.get(enemyAction, "primary"))) {
                debugMessage("Reason: enemy is blocking or dodging");
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
                debugMessage("Reason: enemy cannot block or dodge");
                return {
                    primary: "powerAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
            if(((enemyAction && enemyAction.primary === "block") || enemyCanBlock) && !enemyCanPowerAttack) {
                debugMessage("Reason: enemy is blocking or can block and cannot power attack.");
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
            if((!enemyAction && (enemyCanPowerAttack || enemyCanBasicAttack)) ||
                ["basicAttack", "powerAttack"].includes(_.get(enemyAction, "primary"))) {
                debugMessage("Reason: enemy is attacking or can attack");
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
            if(enemyAction && CombatActions[enemyAction.primary].attack) {
                return {
                    primary: "dodge",
                    enhancements: actingCharacter.defenseEnhancements
                }
            }
            if((!enemyAction && !enemyCanBlock && !enemyCanDodge) || _.get(enemyAction, "primary") === "none") {
                debugMessage("Reason: enemy cannot defend");
                return {
                    primary: "powerAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
            if((enemyAction && enemyAction.primary === "block") || (!enemyAction && enemyCanBlock)) {
                debugMessage("Reason: enemy is blocking or can block");
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
            if(actingCharacter.combat.stamina.eq(actingCharacter.combat.maximumStamina)) {
                return {
                    primary: "basicAttack",
                    enhancements: actingCharacter.attackEnhancements
                }
            }
        }
    },
}

const defenseActions = ["block", "dodge", "none"];