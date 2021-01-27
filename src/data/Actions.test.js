import {getGlobalState, getCharacter, generateCreature} from "../engine";
import {Actions} from "./Actions";
import {Character} from "../character";
import {Decimal} from "decimal.js";
import {onIntimidation} from "../engine/general/onIntimidation";
import resolveCombatRound from "../engine/combat/resolveCombatRound";
import reincarnateAs from "../engine/general/reincarnateAs";
import cleanupDeadCharacters from "../engine/general/cleanupDeadCharacters";

jest.mock("../engine");
jest.mock("../engine/general/onIntimidation");
jest.mock("../engine/combat/resolveAttack");
jest.mock("../engine/combat/resolveCombatRound");
jest.mock("../engine/general/reincarnateAs");
jest.mock("../engine/general/cleanupDeadCharacters");

const resolveAttackMock = jest.requireMock("../engine/combat/resolveAttack").default;

describe("Exploring action", function () {
    let globalState;
    beforeEach(() => {
        globalState = {};
        getGlobalState.mockReturnValue(globalState);
    });
    it("completion clears the current encounter", function () {
        getGlobalState().currentEncounter = {};
        expect(getGlobalState().currentEncounter).toBeDefined();
        Actions["exploring"].complete();
        expect(getGlobalState().currentEncounter).toBeNull();
    });
    it("set next action to given value", function () {
        const nextAction = Actions["exploring"].complete(null, null, null, null, null, null, null, "challenging");
        expect(nextAction).toEqual("challenging");
    });
});

describe("Approaching action", function () {
    let player;
    let globalState;
    let enemy;
    beforeEach(() => {
        getGlobalState.mockClear();
        enemy = new Character({
            id: 1,
            attributes: {},
            tactics: "defensive",
            powerLevel: 1
        });
        globalState = {
            characters: {
                0: player,
                1: enemy
            },
            currentEncounter: {
                enemies: [enemy]
            }
        };
        getGlobalState.mockReturnValue(globalState);
        player = new Character({
            id: 0,
            attributes: {},
            tactics: "defensive",
            powerLevel: 1
        });
    })
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
    let globalState;
    beforeEach(() => {
        getGlobalState.mockClear();
        globalState = {
            currentEncounter: {
                enemies: [
                    {
                        powerLevel: Decimal(1)
                    }
                ]
            }
        }
        getGlobalState.mockReturnValue(globalState);
    });
    it("starts a battle if the player lacks the Stamina", function () {
        const pushLogItem = jest.fn();
        const nextAction = Actions["fleeing"].complete(null, {
            attributes: {
                deceit: 1
            },
            powerLevel: Decimal(1),
            combat: {
                stamina: Decimal(0)
            }
        }, pushLogItem);
        expect(nextAction).toEqual("fighting");
        expect(pushLogItem).toHaveBeenCalled();
    });
    it("moves to recovering", function () {
        const player = {
            attributes: {
                deceit: 1
            },
            powerLevel: Decimal(1),
            combat: {
                stamina: Decimal(100)
            }
        };
        const pushLogItem = jest.fn();
        const nextAction = Actions["fleeing"].complete(null, player, pushLogItem);
        expect(nextAction).toEqual("recovering");
        expect(player.combat.stamina).toEqual(Decimal(76));
        expect(pushLogItem).toHaveBeenCalled();
    });
});

describe("fighting action", function () {
    let player;
    let pushLogItem;
    let applyAction;
    let setActionLog;
    let globalState;
    let enemy;
    beforeEach(() => {
        getGlobalState.mockClear();
        resolveCombatRound.mockClear();
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
        enemy = new Character({
            id: 1,
            powerLevel: Decimal(1),
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            tactics: "defensive",
        });
        globalState = {
            characters: {
                0: player,
                1: enemy
            },
            currentEncounter: {
                currentTick: 0,
                enemies: [enemy]
            },
            actionLog : []
        };
        getGlobalState.mockReturnValue(globalState);
    })
    it("if enemy level <= instantKill enemy is killed automatically", function () {
        globalState.highestLevelEnemyDefeated = Decimal(6);
        globalState.currentEncounter = {
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
    it("End of combat when player is dead", function () {
        player.highestLevelReached = 1;
        player.hp = 0;
        resolveCombatRound.mockReturnValue({
            events: [],
            end: true,
            tick: 100
        });
        globalState.currentEncounter = {
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
        globalState.currentEncounter = {
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
        resolveCombatRound.mockReturnValue({
            events: [],
            tick: 100,
            end: true
        });
        const nextAction = Actions["fighting"].complete(null, player, pushLogItem, null, null, applyAction, setActionLog);
        expect(nextAction).toEqual("recovering");
        expect(pushLogItem).toHaveBeenCalled();
        expect(applyAction).toHaveBeenCalled();
    });
    it("prints a message when combat begins", function () {
        resolveCombatRound.mockReturnValue({
            events: [],
            tick: 100
        });
        player.highestLevelReached = Decimal(2);
        Actions["fighting"].complete(null, player, pushLogItem, null, null, applyAction, setActionLog);
        expect(pushLogItem).toHaveBeenCalledWith("Combat Begins!");
    });
    it("resolves a combat round", function () {
        resolveCombatRound.mockReturnValue({
            events: [],
            tick: 100
        });
        player.highestLevelReached = Decimal(2);
        Actions["fighting"].complete(null, player, pushLogItem, null, null, applyAction, setActionLog);
        expect(resolveCombatRound).toHaveBeenCalled();
    });
});

describe("reincarnating action", function () {
    const action = Actions["reincarnating"];
    let globalState;
    let player;
    let pushLogItem;
    let setPaused;
    let setEnemy;
    beforeEach(() => {
        getGlobalState.mockClear();
        player = {

        };
        globalState = {
            automaticReincarnate: false
        };
        getGlobalState.mockReturnValue(globalState);
        reincarnateAs.mockClear();
        pushLogItem = jest.fn();
        setPaused = jest.fn();
        setEnemy = jest.fn();
    });
    it("return exploring", function () {
        expect(action.complete(null, {
            attributes: {
                baseBrutality: Decimal(1),
                baseCunning: Decimal(1),
                baseDeceit: Decimal(1),
                baseMadness: Decimal(1),
            }
        }, pushLogItem, setPaused, setEnemy)).toEqual(["exploring", "challenging"]);
    });
    it("enables automatic reincarnation", function () {
        expect(globalState.automaticReincarnate).toBeFalsy();
        action.complete(player, {
            attributes: {
                baseBrutality: Decimal(1),
                baseCunning: Decimal(1),
                baseDeceit: Decimal(1),
                baseMadness: Decimal(1),
            }
        }, jest.fn(), jest.fn(), jest.fn());
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
            attributes: {
                cunning: 1
            },
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
            attributes: {
                cunning: 1
            },
            combat: {
                stamina: Decimal(95)
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
            attributes: {
                cunning: Decimal(1)
            },
            combat: {
                stamina: Decimal(1)
            }
        }
        Actions["intimidating"].complete(null, player, pushLogItem);
        expect(player.combat.stamina).toEqual(Decimal(1));
        expect(onIntimidation).not.toHaveBeenCalledTimes(1);
        expect(pushLogItem).toHaveBeenCalledWith("Your lack of stamina allows Enemy to escape! (Required 100 but had 1)");
    });
});

describe("recovering action", function () {
    let player;
    let pushLogItem;
    beforeEach(() => {
        player = {
            hp: Decimal(10),
            maximumHp: Decimal(10),
            healing: Decimal(1),
            combat: {
                stamina: Decimal(2),
                maximumStamina: Decimal(2)
            },
            refreshBeforeCombat: jest.fn()
        };
        pushLogItem = jest.fn();
    });
    it("if player is missing health, they heal some", function () {
        player.hp = player.maximumHp.minus(1);
        Actions["recovering"].complete(null, player, pushLogItem);

        expect(player.hp).toEqual(player.maximumHp);
        expect(pushLogItem).toHaveBeenCalledWith("You recovered 1 health.");
    });
    it("if player is missing stamina, they recover some", function () {
        player.combat.stamina = Decimal(1);
        Actions["recovering"].complete(null, player, pushLogItem);

        expect(player.combat.stamina).toEqual(player.combat.maximumStamina);
        expect(pushLogItem).toHaveBeenCalledWith("You recovered 1 stamina.");
    });
    it("returns exploring and challenging as next actions", function () {
        const nextActions = Actions["recovering"].complete(null, player, pushLogItem);;
        expect(nextActions).toEqual(["exploring", "challenging"]);
    })
});

describe("A precombat action (challenging, hunting, usurp)", function () {
    let player;
    let globalState;
    let enemy;
    let setEnemy;
    let pushLogItem;
    beforeEach(() => {
        getCharacter.mockClear();
        getGlobalState.mockClear();
        generateCreature.mockClear();
        cleanupDeadCharacters.mockClear();
        player = {
            powerLevel: Decimal(1),
            clearStatuses: jest.fn(),
            otherDemonIsGreaterDemon: function (other) {
                this.powerLevel.lt(other.powerLevel);
            },
            otherDemonIsLesserDemon: function (other) {
                this.powerLevel.gt(other.powerLevel);
            }
        };
        globalState = {
            characters: {
                0: player,
                1: enemy
            },
            rival: {},
            currentRegion: "forest",
            passivePowerIncome: Decimal(0)
        };
        enemy = {
            adjectives: [],
            powerLevel: Decimal(1)
        };
        getCharacter.mockReturnValue(player);
        getGlobalState.mockReturnValue(globalState);
        generateCreature.mockReturnValue(enemy);
        setEnemy = jest.fn();
        pushLogItem = jest.fn();
    });
    it("clears the players statuses", function () {
        Actions["challenging"].complete(null, player, pushLogItem, null, setEnemy);
        expect(player.clearStatuses).toHaveBeenCalled();
    });
    it("generates a new encounter and sets enemy", function () {
        expect(globalState.currentEncounter).toBeUndefined();
        Actions["challenging"].complete(null, player, pushLogItem, null, setEnemy);
        expect(globalState.currentEncounter).toBeDefined();
        expect(setEnemy).toHaveBeenCalled();
        expect(pushLogItem).toHaveBeenCalled();
    });
    it("cleans up dead characters", function () {
        expect(cleanupDeadCharacters).not.toHaveBeenCalled();
        Actions["challenging"].complete(null, player, pushLogItem, null, setEnemy);
        expect(cleanupDeadCharacters).toHaveBeenCalled();
    });
})