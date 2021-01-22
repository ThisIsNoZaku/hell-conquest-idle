import {Decimal} from "decimal.js";
import {Creatures} from "../../data/creatures";
import evaluateExpression from "./evaluateExpression";
import {getConfigurationValue} from "../../config";
import {getCharacter, getGlobalState, saveGlobalState} from "../index";
import * as _ from "lodash";

export default function reincarnateAs(monsterId, newAttributes) {
    const globalState = getGlobalState();
    if (monsterId === "random") {
        const options = _.difference(Object.keys(Creatures).filter(m => {
            return _.get(globalState, ["debug", "creatures", m, "enabled"], true) &&
                Creatures[m].enabled !== false
        }), Object.keys(globalState.unlockedMonsters)
            .filter(m => globalState.unlockedMonsters[m]));
        monsterId = options[Math.floor(Math.random() * options.length)];
    }

    if(Creatures[monsterId] === undefined) {
        throw new Error("monsterId was undefined");
    }
    const player = getCharacter(0);

    if (Decimal(getCharacter(0).highestLevelReached).lt(player.powerLevel)) {
        getCharacter(0).highestLevelReached = player.powerLevel;
    }

    // Update player attributes
    Object.keys(player.attributes).forEach(attribute => {
        player.attributes[attribute] = Decimal(newAttributes[attribute]);
    })
    if (globalState.reincarnationCount !== 0) { // FIXME: Removable
        // Calculate your new latent power cap
        // player.latentPowerCap = evaluateExpression(getConfigurationValue("latent_power_cap"), {
        //     highestLevelReached: Decimal(getCharacter(0).highestLevelReached),
        //     highestLevelEnemyDefeated: Decimal(globalState.highestLevelEnemyDefeated)
        // })

        // const latentPowerGain = evaluateExpression(getConfigurationValue("latent_power_gain_on_reincarnate"), {
        //     player
        // });
        // globalState.characters[0].latentPower = Decimal.min(
        //     globalState.latentPowerCap,
        //     globalState.characters[0].latentPower.plus(latentPowerGain));
    }

    globalState.characters[0].reincarnate(monsterId, {...globalState.startingTraits});

    globalState.unlockedMonsters[monsterId] = true;

    globalState.currentEncounter = null;
    getGlobalState().actionLog = [];
    getGlobalState().passivePowerIncome = Decimal(0);
    globalState.reincarnationCount++;
    getGlobalState().currentAction = "exploring";
    getGlobalState().nextAction = "challenging";

    saveGlobalState();
}
