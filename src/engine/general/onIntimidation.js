import evaluateExpression from "./evaluateExpression";
import {getConfigurationValue} from "../../config";
import {getGlobalState} from "../index";
import {Decimal} from "decimal.js";

export function onIntimidation(player, enemy, pushLogItem) {
    if (enemy.isRival) {
        pushLogItem("<strong>You bind your rival to your will!</strong>");
        getGlobalState().rival = {};
    } else {
        pushLogItem(`You bind ${enemy.name}!`);
    }
    const periodicPowerIncreases = evaluateExpression(getConfigurationValue("mechanics.xp.gainedFromLesserDemon"), {
        enemy
    });
    getGlobalState().passivePowerIncome = getGlobalState().passivePowerIncome.plus(periodicPowerIncreases);
    getGlobalState().highestLevelEnemyDefeated = Decimal.max(getGlobalState().highestLevelEnemyDefeated, enemy.powerLevel);
}