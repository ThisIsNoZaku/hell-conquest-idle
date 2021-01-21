import {getCharacter, getGlobalState} from "../index";
import {Decimal} from "decimal.js";
import {onIntimidation} from "./onIntimidation";

jest.mock("../index");

describe("onIntimidation", function () {
    let player;
    let globalState;
    let pushLogItem;
    beforeEach(() => {
        player = {
            latentPower: Decimal(0)
        };
        globalState = {
            passivePowerIncome: Decimal(0),
            highestLevelEnemyDefeated: Decimal(0),
            characters: {
                0: player
            }
        };

        getGlobalState.mockReturnValue(globalState);
        getCharacter.mockReturnValue(player);
        pushLogItem = jest.fn();
    });
    it("updates stolen power", function () {
        onIntimidation(player, {powerLevel: Decimal(1)}, pushLogItem);
        expect(player.latentPower).toEqual(Decimal(10));
    });
    it("prints a message and clears the player rival if the enemy is a rival", function () {
        globalState.rival = {
            powerLevel: Decimal(1),
            isRival: true,
            name: "enemy"
        }
        onIntimidation(player, globalState.rival, pushLogItem);
        expect(pushLogItem).toHaveBeenCalledWith("<strong>You bind your rival to your will!</strong>");
        expect(globalState.rival).toEqual({});
    });

})