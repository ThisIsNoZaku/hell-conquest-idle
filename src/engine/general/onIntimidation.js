import evaluateExpression from "./evaluateExpression";
import {getConfigurationValue} from "../../config";
import {getGlobalState} from "../index";
import {Decimal} from "decimal.js";

export function onIntimidation(player, enemy, pushLogItem) {
    if (enemy.isRival) {
        pushLogItem("<strong>You bind your rival to your will!</strong>");
        getGlobalState().rival = {};
    }
    const periodicPowerIncreases = evaluateExpression(getConfigurationValue("mechanics.xp.gainedFromLesserDemon"), {
        enemy
    });
    player.latentPower = player.latentPower.plus(periodicPowerIncreases);
    player.highestLevelEnemyDefeated = Decimal.max(player.highestLevelEnemyDefeated, enemy.powerLevel);
}