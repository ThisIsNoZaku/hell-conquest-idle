import evaluateExpression from "./evaluateExpression";
import {getConfigurationValue} from "../../config";
import {getCharacter, getGlobalState} from "../index";
import {Decimal} from "decimal.js";

export function onIntimidation(player, enemy, pushLogItem) {
    if (enemy.isRival) {
        pushLogItem("<strong>You bend your rival to your will!</strong>");
        getGlobalState().rival = {};
    } else {
        pushLogItem(`You bind ${enemy.name}!`);
    }
    const periodicPowerIncreases = evaluateExpression(getConfigurationValue("mechanics.xp.gainedFromLesserDemon"), {
        enemy
    });
    getCharacter(0).stolenPower = getCharacter(0).stolenPower.plus(periodicPowerIncreases);
    getGlobalState().highestLevelEnemyDefeated = Decimal.max(getGlobalState().highestLevelEnemyDefeated, enemy.powerLevel);
}