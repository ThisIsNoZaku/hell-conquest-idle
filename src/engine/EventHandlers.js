import {getCharacter, getGlobalState} from "./index";
import {config, getConfigurationValue} from "../config";
import {debugMessage} from "../debugging";
import evaluateExpression from "./general/evaluateExpression";
import {Traits} from "../data/Traits";
import {Decimal} from "decimal.js";
import {v4} from "node-uuid";
import * as _ from "lodash";
import {enableTutorial} from "./tutorials";
import triggerEvent from "./general/triggerEvent";
import generateRoundActionLogItems from "./general/generateRoundActionLogItems";

export const EventHandlers = {
    "add-status": function (event, sourceCharacter, targetCharacter) {
        targetCharacter.statuses[event.status].push({
            source: event.source,
            stacks: event.stacks,
            duration: event.duration
        });
    },
    "remove-status": function (event, sourceCharacter, targetCharacter) {
        const statusToRemove = targetCharacter.statuses[event.status].find(s => s.uuid === event.toRemove);
        if (Decimal(statusToRemove.stacks).lte(event.stacks)) {
            targetCharacter.statuses[event.status] = targetCharacter.statuses[event.status]
                .filter(s => s.uuid !== event.toRemove);
        } else {
            statusToRemove.stacks = Decimal(statusToRemove.stacks).minus(event.stacks);
        }
    },
    "kill": function (event, sourceCharacter, targetCharacter, pushLogItem) {
        const actingCharacter = getCharacter(event.source.character);
        const deadCharacter = getCharacter(event.target);
        if (deadCharacter.id !== 0 && getCharacter(0).isAlive) {
            enableTutorial("leveling-up");
            debugMessage("Player killed an enemy and gained power.");
            const player = getCharacter(0);
            const powerToGain = evaluateExpression(getConfigurationValue("mechanics.xp.gainedFromOtherDemon"), {
                enemy: deadCharacter
            });
            const roundEvents = [];
            triggerEvent({
                type: "on_kill",
                combatants: {0: player},
                source: {character: player},
                target: deadCharacter,
                roundEvents
            });
            const messages = generateRoundActionLogItems({
                events: roundEvents
            });
            messages.forEach(pushLogItem);
            let multiplier = Object.keys(player.traits).reduce((multiplier, trait) => {
                const traitMultiplier = evaluateExpression(_.get(Traits[trait], ["continuous", "trigger_effects", "power_gain_modifier"], 0),
                    {
                        tier: Decimal(player.traits[trait])
                    });
                return multiplier.plus(traitMultiplier);
            }, Decimal(1));

            const powerGained = player.gainPower(powerToGain.times(multiplier).floor());
            pushLogItem(`You gained ${powerGained.toFixed()} power.`);
            player.highestLevelEnemyDefeated = Decimal.max(player.highestLevelEnemyDefeated, deadCharacter.powerLevel);
            getCharacter(0).highestLevelReached = Decimal.max(getCharacter(0).highestLevelReached, getCharacter(0).powerLevel); // FIXME: Move into character levelup method.

            if (deadCharacter.isRival) {
                getGlobalState().rival = {};
                pushLogItem({
                    message: "You've defeated your rival!",
                    uuid: v4()
                })
            }
        } else if (deadCharacter.id === 0) {
            if (Decimal(deadCharacter.powerLevel).gt(getGlobalState().rival.level || 0) && deadCharacter.id !== actingCharacter.id) {
                getGlobalState().rival = {...actingCharacter};
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