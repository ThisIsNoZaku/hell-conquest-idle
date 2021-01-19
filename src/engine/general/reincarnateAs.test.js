import {getCharacter, getGlobalState} from "../index";
import Decimal from "decimal.js";
import * as _ from "lodash";
import reincarnateAs from "./reincarnateAs";

jest.mock("../");

describe("reincarnateAt", function () {
    let globalState;
    let player;
    beforeEach(() => {
        player = {
            reincarnate: jest.fn(),
            highestLevelReached: Decimal(1),
            latentPower: Decimal(0),
            powerLevel: Decimal(1),
            attributes: {
                baseBrutality: Decimal(1),
                baseDeceit:  Decimal(1),
                baseCunning:Decimal(1),
                baseMadness: Decimal(1),
            }
        };
        globalState = {
            characters: {
                0: player
            },
            unlockedMonsters: {},
            highestLevelEnemyDefeated: Decimal(0)
        }
        getGlobalState.mockReturnValue(globalState);
        getCharacter.mockReturnValue(player);
    })
    it("throws an error if no monster matches", function () {
        expect(() => {
            reincarnateAs();
        }).toThrowErrorMatchingSnapshot();
    })
    it("it updates highest level reached", function () {
        expect(getCharacter(0).highestLevelReached).toEqual(Decimal(1));
        _.set(getGlobalState(), ["characters", "0", "powerLevel"], Decimal(2));
        reincarnateAs("bloodthirstyKnight", {
            baseBrutality: 1,
            baseCunning: 1,
            baseMadness: 1,
            baseDeceit: 1
        });
        expect(getCharacter(0).highestLevelReached).toEqual(Decimal(2));
    });
    it("if monster is random, reincarnate as a different one", function () {
        reincarnateAs("random", {
            baseBrutality: 1,
            baseCunning: 1,
            baseMadness: 1,
            baseDeceit: 1
        });
        expect(getGlobalState().characters[0].reincarnate)
            .toHaveBeenCalledWith(expect.any(String), {});
        expect(getGlobalState().characters[0].reincarnate)
            .not.toHaveBeenCalledWith("random", {});
    });
    it("recalculates latent power cap on reincarnations after first", function () {
        getGlobalState().reincarnationCount = 1;
        getGlobalState().highestLevelEnemyDefeated = Decimal(1);
        reincarnateAs("random", {
            baseBrutality: 1,
            baseCunning: 1,
            baseMadness: 1,
            baseDeceit: 1
        });
        expect(getGlobalState().latentPowerCap).toEqual(Decimal(25));
        const playerLatentPower = getCharacter(0).latentPower;
        expect(playerLatentPower).toEqual(Decimal(5));
    });
})