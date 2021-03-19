import evaluateExpression from "./evaluateExpression";
import {getConfigurationValue} from "../../config";
import {getGlobalState} from "../index";
import {Decimal} from "decimal.js";
import calculateLatentPowerGain from "./calculateLatentPowerGain";

export function onIntimidation(player, enemy, pushLogItem) {
    if (enemy.isRival) {
        pushLogItem("<strong>You bind your rival to your will!</strong>");
        getGlobalState().rival = {};
    }

    const latentPowerGain = calculateLatentPowerGain(enemy);

    player.latentPower = player.latentPower.plus(latentPowerGain);
    player.highestLevelEnemyDefeated = Decimal.max(player.highestLevelEnemyDefeated, enemy.powerLevel);
}