import {getCharacter, getGlobalState} from "./index";
import {config, getConfigurationValue} from "../config";
import {debugMessage} from "../debugging";
import evaluateExpression from "./general/evaluateExpression";
import {Traits} from "../data/Traits";
import {Decimal} from "decimal.js";
import {v4} from "node-uuid";
import * as _ from "lodash";
import getPowerNeededForLevel from "./general/getPowerNeededForLevel";
import {act} from "@testing-library/react";
import {enableTutorial} from "./tutorials";

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
        if(Decimal(statusToRemove.stacks).lte(event.stacks)) {
            targetCharacter.statuses[event.status] = targetCharacter.statuses[event.status]
                .filter(s => s.uuid !== event.toRemove);
        } else {
            statusToRemove.stacks = Decimal(statusToRemove.stacks).minus(event.stacks);
        }
    },
    "kill": function (event, sourceCharacter, targetCharacter, pushLogItem) {
        const deadCharacter = getCharacter(event.target);
        const actingCharacter = getCharacter(event.source);
        if (actingCharacter.id === 0 && actingCharacter.id !== deadCharacter.id) {
            enableTutorial("leveling-up");
            debugMessage("Player killed an enemy and gained power.");
            const player = getCharacter(0);
            const powerToGain = evaluateExpression(getConfigurationValue("mechanics.xp.gainedFromOtherDemon"), {
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
            if (player.absorbedPower.gte(getPowerNeededForLevel(player.powerLevel.plus(1)))) {
                player.levelUp();
            }
            if (!pregainLevel.eq(player.powerLevel)) {
                const hp = player.hp;
                player.hp = player.maximumHp;
                player.combat.stamina = player.combat.maximumStamina;
                pushLogItem({
                    message: `The surge of new power heals you for ${player.hp.minus(hp)} health.`,
                    uuid: v4()
                });
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