import {getCharacter, getGlobalState} from "./index";
import {config} from "../config";
import {debugMessage} from "../debugging";
import evaluateExpression from "./general/evaluateExpression";
import {Traits} from "../data/Traits";
import {Decimal} from "decimal.js";
import {v4} from "node-uuid";
import * as _ from "lodash";

export const EventHandlers = {
    "add-status" : function(event, sourceCharacter, targetCharacter) {
        targetCharacter.statuses[event.status] = Decimal(event.stacks);
    },
    "remove-status" : function (event, sourceCharacter, targetCharacter) {
        targetCharacter.statuses[event.status] = Decimal.max(0,
            Decimal(targetCharacter.statuses[event.status]).minus(event.stacks)
            );
    },
    "combat-end": function(event, sourceCharacter, targetCharacter) {
        if (!getCharacter(0).isAlive) {
            getGlobalState().nextAction = "reincarnating";
        } else {
            if (config.mechanics.artifacts.enabled) {
                getGlobalState().nextAction = "looting";
            } else {
                getGlobalState().nextAction = "exploring";
            }
        }
    },
    "kill" : function(event, sourceCharacter, targetCharacter, pushLogItem) {
        const deadCharacter = getCharacter(event.target);
        const actingCharacter = getCharacter(event.source);
        if (actingCharacter.id === 0 && actingCharacter.id !== deadCharacter.id) {
            debugMessage("Player killed an deadCharacter and gained power.");
            const player = getCharacter(0);
            const powerToGain = evaluateExpression(config.mechanics.xp.gainedFromOtherDemon, {
                enemy: deadCharacter
            });
            let multiplier = Object.keys(player.traits).reduce((multiplier, trait) => {
                const traitMultiplier = evaluateExpression(_.get(Traits[trait].on_kill, ["effects", "power_gain_modifier"], 0),
                    {
                        rank: Decimal(player.traits[trait])
                    });
                return multiplier.plus(traitMultiplier);
            }, Decimal(1));
            const pregainLevel = player.powerLevel;
            const powerGained = player.gainPower(powerToGain.times(multiplier).floor());
            pushLogItem(`You gained ${powerGained.toFixed()} power.`);
            if (!pregainLevel.eq(player.powerLevel)) {
                const hp = player.hp;
                player.hp = player.maximumHp;
                pushLogItem({
                    message: `The surge of new power heals you for ${player.hp.minus(hp)} health.`,
                    uuid: v4()
                })
            }
            if (!getGlobalState().automaticReincarnate) {
                getGlobalState().highestLevelEnemyDefeated = Decimal.max(getGlobalState().highestLevelEnemyDefeated, deadCharacter.powerLevel);
            }
            getCharacter(0).highestLevelReached = Decimal.max(getCharacter(0).highestLevelReached, getCharacter(0).powerLevel);
            if (deadCharacter.isRival) {
                getGlobalState().rival = {};
                pushLogItem({
                    message: "You've defeated your rival!",
                    uuid: v4()
                })
            }
        } else if (deadCharacter.id === 0) {
            if (Decimal(deadCharacter.powerLevel).gt(getGlobalState().rival.level || 0)) {
                getGlobalState().rival = {
                    level: actingCharacter.powerLevel,
                    type: actingCharacter.appearance,
                    traits: actingCharacter.traits,
                    tactics: actingCharacter.tactics
                }
                pushLogItem({
                    message: "<strong>You have a new rival!</strong>",
                    uuid: v4()
                })
            }
            getCharacter(0).hp = Decimal(0);
        }
    },
    "damage": function (event, sourceCharacter, targetCharacter) {
        targetCharacter.hp = Decimal.max(targetCharacter.hp.minus(event.value), 0);
    },
    "fatigue-damage": function (event, sourceCharacter, targetCharacter) {
        targetCharacter.hp = Decimal.max(targetCharacter.hp.minus(event.value), 0);
    }
}