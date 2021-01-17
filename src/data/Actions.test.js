import {getGlobalState, reincarnateAs} from "../engine";
import {Actions} from "./Actions";
import * as _ from "lodash";
import {Character} from "../character";
import {Decimal} from "decimal.js";
import {onIntimidation} from "../engine/general/onIntimidation";

jest.mock("../engine");
jest.mock("../engine/general/onIntimidation");
jest.mock("../engine/combat/resolveAttack");
const resolveAttackMock = jest.requireMock("../engine/combat/resolveAttack").default;

describe("Exploring action", function () {
    beforeEach(() => {
    });
    it("completion clears the current encounter", function () {
        getGlobalState().currentEncounter = {};
        expect(getGlobalState().currentEncounter).toBeDefined();
        Actions["exploring"].complete();
        expect(getGlobalState().currentEncounter).toBeNull();
    });
    it("set 'challenging' to next action", function () {
        const nextAction = Actions["exploring"].complete();
        expect(nextAction).toEqual("challenging");
    });
});

describe("Approaching action", function () {
    let player;
    beforeEach(() => {
        _.set(getGlobalState(), ["currentEncounter", "enemies"], [
            new Character({
                id: 1,
                attributes: {},
                tactics: "defensive",
                powerLevel: 1
            })]);
        player = new Character({
            id: 0,
            attributes: {},
            tactics: "defensive",
            powerLevel: 1
        });
    })
    it("if next action is 'fighting', resolves combat", function () {
        const setEnemyMock = jest.fn();
        resolveAttackMock.mockReturnValue({
            effect: [],
            hitType: 0
        });
        Actions["approaching"].complete(null, player, null, null, setEnemyMock, null, null, "fighting");
        expect(getGlobalState().currentEncounter.pendingActions).toBeDefined();
    });
    it("if next action is 'fighting', setEnemy", function () {
        const setEnemyMock = jest.fn();
        resolveAttackMock.mockReturnValue({
            effect: [],
            hitType: 0
        });
        Actions["approaching"].complete(null, player, null, null, setEnemyMock, null, null, "fighting");
        expect(setEnemyMock).toHaveBeenCalled();
    });
});

describe("Fleeing action", function () {
    it("starts a battle if the player lacks the Stamina", function () {
        const pushLogItem = jest.fn();
        const nextAction = Actions["fleeing"].complete(null, {
            powerLevel: Decimal(1),
            combat: {
                stamina: Decimal(0)
            }
        }, pushLogItem);
        expect(nextAction).toEqual("fighting");
        expect(pushLogItem).toHaveBeenCalled();
    });
    it("moves to exploring and consumes the stamina if the player has enough", function () {
        const player = {
            powerLevel: Decimal(1),
            combat: {
                stamina: Decimal(99)
            }
        };
        const pushLogItem = jest.fn();
        const nextAction = Actions["fleeing"].complete(null, player, pushLogItem);
        expect(nextAction).toEqual("exploring");
        expect(player.combat.stamina).toEqual(Decimal(94));
        expect(pushLogItem).toHaveBeenCalled();
    });
});

describe("fighting action", function () {
    let player;
    let pushLogItem;
    let applyAction;
    let setActionLog;
    beforeEach(() => {
        player = new Character({
            id: 0,
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            powerLevel: 1,
            highestLevelReached: 6,
            traits: {},
            party: 0,
            tactics: "defensive",
            combat: {
                precisionPoints: 0,
                evasionPoints: 0
            }
        });
        pushLogItem = jest.fn();
        applyAction = jest.fn();
        setActionLog = jest.fn();
        getGlobalState().actionLog = [];
    })
    it("if enemy level <= instantKill enemy is killed automatically", function () {
        getGlobalState().highestLevelEnemyDefeated = Decimal(6);
        getGlobalState().currentEncounter = {
            pendingActions: [],
            enemies: [new Character({
                id: 1,
                tactics: "defensive",
                powerLevel: Decimal(1)
            })]
        };
        const nextAction = Actions["fighting"].complete(null, player, pushLogItem, null, null, applyAction);
        expect(nextAction).toEqual(["exploring", "challenging"]);
    });
    it("if has pending actions, resolves it", function () {
        player.highestLevelReached = 1;
        getGlobalState().currentEncounter = {
            pendingActions: [
                {
                    end: false,
                    event: [],
                    tick: 100
                }
            ],
            enemies: [new Character({
                id: 1,
                tactics: "defensive",
                powerLevel: Decimal(1)
            })]
        };
        resolveAttackMock.mockReturnValue({
            effects: [],
            hitType: 0
        });
        const nextAction = Actions["fighting"].complete(null, player, pushLogItem, null, null, applyAction, setActionLog);
        expect(nextAction).toEqual("fighting");
        expect(pushLogItem).toHaveBeenCalled();
        expect(applyAction).toHaveBeenCalled();
    });
    it("End of combat when player is dead", function () {
        player.highestLevelReached = 1;
        player.hp = 0;
        resolveAttackMock.mockReturnValue({
            effects: [],
            hitType: 0
        })
        getGlobalState().currentEncounter = {
            pendingActions: [
                {
                    end: true,
                    event: [],
                    tick: 100
                }
            ],
            enemies: [new Character({
                id: 1,
                powerLevel: Decimal(1),
                traits: {},
                tactics: "defensive"
            })]
        };
        const nextAction = Actions["fighting"].complete(null, player, pushLogItem, null, null, applyAction, setActionLog);
        expect(nextAction).toEqual("reincarnating");
        expect(pushLogItem).toHaveBeenCalled();
        expect(applyAction).toHaveBeenCalled();
    });
    it("End of combat when player is alive", function () {
        player.highestLevelReached = 1;
        player.hp = 1;
        getGlobalState().currentEncounter = {
            currentTick: 100,
            enemies: [new Character({
                id: 1,
                powerLevel: Decimal(1),
                hp: 0,
                traits: {},
                party: 1,
                tactics: "defensive",
                combat: {
                    precisionPoints: 0,
                    evasionPoints: 0,
                }
            })]
        };
        resolveAttackMock.mockReturnValue({
            effects: [],
            hitType: 0
        });
        const nextAction = Actions["fighting"].complete(null, player, pushLogItem, null, null, applyAction, setActionLog);
        expect(nextAction).toEqual(["exploring", "challenging"]);
        expect(pushLogItem).toHaveBeenCalled();
        expect(applyAction).toHaveBeenCalled();
    });
});

describe("reincarnating action", function () {
    const action = Actions["reincarnating"];
    beforeEach(() => {
        getGlobalState().automaticReincarnate = false;
        reincarnateAs.mockClear();
    });
    it("return exploring", function () {
        expect(action.complete(null, {
            attributes: {
                baseBrutality: Decimal(1),
                baseCunning: Decimal(1),
                baseDeceit: Decimal(1),
                baseMadness: Decimal(1),
            }
        })).toEqual("exploring");
    });
    it("enables automatic reincarnation", function () {
        const globalState = getGlobalState();
        expect(globalState.automaticReincarnate).toBeFalsy();
        expect(reincarnateAs).not.toHaveBeenCalled();
        action.complete(null, {
            attributes: {
                baseBrutality: Decimal(1),
                baseCunning: Decimal(1),
                baseDeceit: Decimal(1),
                baseMadness: Decimal(1),
            }
        });
        expect(getGlobalState().automaticReincarnate).toEqual(true);
        expect(reincarnateAs).toHaveBeenCalled();
    })
})

describe("intimidating action", function () {
    beforeEach(() => {
        onIntimidation.mockClear();
    });
    it("if enemy level is less than instant kill level, they are automatically intimidated", function () {
        getGlobalState().currentEncounter = {
            enemies: [
                {
                    id: 1,
                    name: "Enemy",
                    powerLevel: Decimal(1)
                }
            ]
        }
        const pushLogItem = jest.fn();
        Actions["intimidating"].complete(null, {
            highestLevelReached: Decimal(11)
        }, pushLogItem);
        expect(pushLogItem).toHaveBeenCalledWith("Your force of will seizes control of Enemy's mind!");
        expect(onIntimidation).toHaveBeenCalledTimes(1);
    });
    it("if player has more stamina, they intimidate the enemy", function () {
        getGlobalState().currentEncounter = {
            enemies: [
                {
                    id: 1,
                    name: "Enemy",
                    powerLevel: Decimal(1),
                    combat: {
                        stamina: Decimal(1)
                    }
                }
            ]
        }
        const pushLogItem = jest.fn();
        const player = {
            highestLevelReached: 1,
            combat: {
                stamina: Decimal(1)
            }
        }
        Actions["intimidating"].complete(null, player, pushLogItem);
        expect(player.combat.stamina).toEqual(Decimal(0));
        expect(onIntimidation).toHaveBeenCalledTimes(1);
    });
    it("if player has less stamina, enemy escapes", function () {
        getGlobalState().currentEncounter = {
            enemies: [
                {
                    id: 1,
                    name: "Enemy",
                    powerLevel: Decimal(1),
                    combat: {
                        stamina: Decimal(3)
                    }
                }
            ]
        }
        const pushLogItem = jest.fn();
        const player = {
            highestLevelReached: 1,
            combat: {
                stamina: Decimal(1)
            }
        }
        Actions["intimidating"].complete(null, player, pushLogItem);
        expect(player.combat.stamina).toEqual(Decimal(1));
        expect(onIntimidation).not.toHaveBeenCalledTimes(1);
        expect(pushLogItem).toHaveBeenCalledWith("Your lack of stamina allows Enemy to escape!");
    });
});