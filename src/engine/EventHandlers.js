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
            // FIXME: move into method
            triggerEvent({
                type: "on_kill",
                combatants: {0: player},
                source: {character: player},
                target: deadCharacter,
                roundEvents
            });
            getGlobalState().unlockedMonsters[deadCharacter.appearance] = true;
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
                pushLogItem({
                    message: "You've defeated your rival!",
                    uuid: v4()
                });
            }
            if(deadCharacter.loyalty !== "none") {
                Object.keys(faction => {
                    if(faction !== deadCharacter.loyalty) {
                        getGlobalState().factions[faction] = Math.min(getGlobalState("good_reputation_cap"), getGlobalState().factions[faction] + 1);
                    } else {
                        getGlobalState().factions[faction] = Math.max(getGlobalState("bad_reputation_floor"), getGlobalState().factions[faction] - 1);
                    }
                })
            }
        } else if (deadCharacter.id === 0) {
            if (!getGlobalState().rivals[actingCharacter.powerLevel.toNumber()]) {
                const enemy = getGlobalState().currentEncounter.enemies[0];
                getGlobalState().rivals[enemy.powerLevel.toNumber()] = {
                    character: {...enemy},
                    tactics: {
                        offensive: deadCharacter.tactics.offensive,
                        defensive: deadCharacter.tactics.defensive
                    }
                };
                pushLogItem({
                    message: "<strong>You have a new rival!</strong>",
                    uuid: v4()
                });
            }
            getCharacter(0).hp = Decimal(0);
        }
    }
}