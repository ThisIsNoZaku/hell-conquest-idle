import Decimal from "decimal.js";
import resolveCombatRound from "../combat/resolveCombatRound";
import * as _ from "lodash";
import {Character} from "../../character";
import triggerEvent from "./triggerEvent";
import calculateDamageBy from "../combat/calculateDamageBy";
import calculateAttackDowngradeCost from "../combat/calculateAttackDowngradeCost";
import calculateAttackUpgradeCost from "../combat/calculateAttackUpgradeCost";
import resolveAttack from "../combat/resolveAttack";
import {generateHitEvents} from "../events/generate";
import {getCharacter} from "../index";

jest.mock("../index");
jest.mock("../combat/resolveAttack");
const resolveAttackMock = jest.requireMock("../combat/resolveAttack").default;

describe("blood rage trait", function () {
    let player;
    let enemy;
    beforeEach(() => {
        resolveAttackMock.mockReturnValue({
            effects: [],
            hitType: 0
        });
        player = new Character({
            isPc: true,
            id: 0,
            hp: 50,
            tactics: "defensive",
            powerLevel: 1,
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                evasionPoints: 0,
                precisionPoints: 0
            },
        }, 0);
        enemy = new Character({
            id: 1,
            hp: 25,
            powerLevel: 1,
            tactics: "defensive",
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                evasionPoints: 0,
                precisionPoints: 0
            },
        }, 1);
    })
    afterEach(() => {
        resolveAttackMock.mockClear();
    })
    it("triggers on round end", function () {
        _.set(player, ["traits", "bloodrage"], 1);
        enemy.hp = Decimal(1);
        enemy.combat.precisonPoints = Decimal(200);
        resolveCombatRound(100, {0: player, 1: enemy});
        expect(player.statuses).toEqual({
            berserk: [{
                stacks: Decimal(1),
                source: {
                    character: 0,
                    trait: "bloodrage"
                },
                duration: 3,
                uuid: expect.any(String)
            }]
        });
    });
})
describe("carrion_feeder trait", function () {
    let player;
    let enemy;
    beforeEach(() => {
        resolveAttackMock.mockClear();

        player = new Character({
            isPc: true,
            id: 0,
            hp: 50,
            tactics: "defensive",
            powerLevel: 1,
            traits: {
                carrion_feeder: 1
            },
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                evasionPoints: 0,
                precisionPoints: 0
            },
        }, 0);
        enemy = new Character({
            id: 1,
            hp: 25,
            powerLevel: 1,
            tactics: "defensive",
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                evasionPoints: 0,
                precisionPoints: 0
            },
        }, 1);
    });
    it("adds stack of engorged on kill", function () {
        triggerEvent({
            type: "on_kill",
            source: {character: player},
            target: enemy,
            combatants: {0: player, 1: enemy},
            roundEvents: []
        });
        expect(player.statuses["engorged"])
            .toEqual([
                {
                    duration: -1,
                    uuid: expect.any(String),
                    source: {
                        character: 0,
                        trait: "carrion_feeder"
                    },
                    stacks: Decimal(1),
                }
            ])
    });
    it("stacks of engorged gained on kill combine", function () {
        player.statuses["engorged"] = [
            {
                source: {
                    character: 0,
                    trait: "carrion_feeder"
                },
                stacks: Decimal(1),
                uuid: "1234567890"
            }
        ]

        triggerEvent({
            type: "on_kill",
            source: {character: player},
            target: enemy,
            combatants: {0: player, 1: enemy},
            roundEvents: []
        });
        expect(player.statuses["engorged"])
            .toEqual([
                {
                    duration: -1,
                    uuid: expect.any(String),
                    source: {
                        character: 0,
                        trait: "carrion_feeder"
                    },
                    stacks: Decimal(2),
                }
            ])
    });
    it("adds a max of 10 stacks of engorged", function () {
        player.statuses["engorged"] = [
            {
                stacks: Decimal(10),
                source: {
                    character: 0,
                    trait: "carrion_feeder"
                },
                duration: 999,
                uuid: "1234567890"
            }
        ]
        triggerEvent({
            type: "on_kill",
            source: { character: player },
            target: enemy,
            combatants: {0: player, 1: enemy},
            roundEvents: []
        });
        expect(player.statuses["engorged"])
            .toEqual([
                {
                    duration: -1,
                    uuid: expect.any(String),
                    source: {
                        character: 0,
                        trait: "carrion_feeder"
                    },
                    stacks: Decimal(10),
                }
            ])
    });
});
describe("inescapable grasp trait", function () {
    let player;
    let enemy;
    beforeEach(() => {
        resolveAttackMock.mockClear();

        player = new Character({
            isPc: true,
            id: 0,
            hp: 50,
            tactics: "defensive",
            powerLevel: 1,
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                evasionPoints: 0,
                precisionPoints: 0
            },
        }, 0);
        enemy = new Character({
            id: 1,
            hp: 25,
            powerLevel: 1,
            tactics: "defensive",
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                evasionPoints: 0,
                precisionPoints: 0
            },
        }, 1);
    });
    it("inescapable grasp adds stacks of restrained on devastating hit", function () {
        resolveAttackMock.mockReturnValue({
            effects: [],
            hitType: 1,
        });
        _.set(player, ["traits", "inescapableGrasp"], 1);
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            tick: 100,
            end: false,
            initiativeOrder: [0, 1],
            events: [
                {
                    event: "add-status",
                    source: {character: 0, trait: "inescapableGrasp"},
                    target: 1,
                    status: "restrained",
                    uuid: expect.any(String),
                    stacks: Decimal(1),
                    duration: 1
                },
            ]
        });
    });
});
describe("killing blow trait", function () {
    let player;
    let enemy;
    beforeEach(() => {
        resolveAttackMock.mockClear();

        player = new Character({
            isPc: true,
            id: 0,
            hp: 50,
            tactics: "defensive",
            powerLevel: 1,
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            traits: {
                killingBlow: 1
            },
            combat: {
                evasionPoints: 0,
                precisionPoints: 0
            },
        }, 0);
        enemy = new Character({
            id: 1,
            hp: 25,
            powerLevel: 1,
            tactics: "defensive",
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                evasionPoints: 0,
                precisionPoints: 0
            },
        }, 1);
    });
    it("increases devastating hit damage", function () {
        const calculatedDamage = calculateDamageBy(player)
            .against(enemy);
        expect(calculatedDamage[1]).toEqual(Decimal(10).times(1.5).times(1.1).floor());
    });
});
describe("mindless blow trait", function () {
    let player;
    let enemy;
    beforeEach(() => {
        resolveAttackMock.mockClear();

        player = new Character({
            isPc: true,
            id: 0,
            hp: 50,
            tactics: "defensive",
            powerLevel: 1,
            traits: {
                immortalWarrior: 1
            },
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                evasionPoints: 0,
                precisionPoints: 0
            },
        }, 0);
        enemy = new Character({
            id: 1,
            hp: 25,
            powerLevel: 1,
            tactics: "defensive",
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                evasionPoints: 0,
                precisionPoints: 0
            },
        }, 1);
    });
    it("increases the cost to downgrade your attacks", function () {
        const cost = calculateAttackDowngradeCost(enemy, player);
        expect(cost).toEqual(Decimal(72 * 1.1).floor());
    });
});
describe("piercing strike trait", function () {
    let player;
    let enemy;
    beforeEach(() => {
        resolveAttackMock.mockClear();

        player = new Character({
            isPc: true,
            id: 0,
            hp: 50,
            tactics: "defensive",
            powerLevel: 1,
            traits: {
                piercingStrike: 1
            },
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                evasionPoints: 0,
                precisionPoints: 0
            },
        }, 0);
        enemy = new Character({
            id: 1,
            hp: 25,
            powerLevel: 1,
            tactics: "defensive",
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                evasionPoints: 0,
                precisionPoints: 0
            },
        }, 1);
    });
    it("decreases the cost to upgrade your attacks", function () {
        const cost = calculateAttackUpgradeCost(player, enemy);
        expect(cost).toEqual(Decimal(100).times(1 - (1.1 * .05)).ceil());
    });
});
describe("relentless trait", function () {
    let player;
    let enemy;
    beforeEach(() => {
        resolveAttackMock.mockClear();

        player = new Character({
            isPc: true,
            id: 0,
            hp: 50,
            tactics: "defensive",
            powerLevel: 1,
            traits: {
                relentless: 1
            },
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                evasionPoints: 0,
                precisionPoints: 0
            },
        }, 0);
        enemy = new Character({
            id: 1,
            hp: 25,
            powerLevel: 1,
            tactics: "defensive",
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                evasionPoints: 0,
                precisionPoints: 0
            },
        }, 1);
    });
    it("increases your maximum stamina", function () {
        expect(player.combat.maximumStamina).toEqual(Decimal(400).floor());
    })
});
describe("searing venom trait", function () {
    let player;
    let enemy;
    beforeEach(() => {
        resolveAttackMock.mockClear();

        player = new Character({
            isPc: true,
            id: 0,
            hp: 50,
            tactics: "defensive",
            powerLevel: 1,
            traits: {
                searingVenom: 1
            },
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                evasionPoints: 0,
                precisionPoints: 0
            },
        }, 0);
        enemy = new Character({
            id: 1,
            hp: 25,
            powerLevel: 1,
            tactics: "defensive",
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                stamina: Decimal(0),
            },
        }, 1);
    });
    it("adds stacks on critical hit", function () {
        resolveAttackMock
            .mockReturnValueOnce(generateHitEvents(0, player, enemy, 5, 0, 0, 0, 0))
            .mockReturnValueOnce(generateHitEvents(0, enemy, player, 5, 0, 0, 0, 0))
        const result = resolveCombatRound(100, {0: player, 1: enemy});
        expect(enemy.statuses["painfulVenom"]).toBeDefined();
        expect(result.events).toContainEqual({
            event: "add-status",
            duration: 2,
            source: {
                character: 0,
                trait: "searingVenom"
            },
            status: "painfulVenom",
            target: 1,
            stacks: Decimal(1),
            uuid: expect.any(String)
        });
    });
})
describe("shared pain trait", function () {
    let player;
    let enemy;
    beforeEach(() => {
        resolveAttackMock.mockClear();

        player = new Character({
            isPc: true,
            id: 0,
            hp: 50,
            tactics: "defensive",
            powerLevel: 1,
            traits: {
                sharedPain: 1
            },
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                evasionPoints: 0,
                precisionPoints: 0
            },
        }, 0);
        enemy = new Character({
            id: 1,
            hp: 25,
            powerLevel: 1,
            tactics: "defensive",
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                stamina: Decimal(0),
            },
        }, 1);
    });
    it("causes retaliation damage to attackers", function () {
        getCharacter.mockReturnValueOnce(player)
            .mockReturnValueOnce(enemy);
        resolveAttack.mockReturnValueOnce(generateHitEvents(0, player, enemy, 10, 0, 0, 0, 0)
        ).mockReturnValueOnce(generateHitEvents(0, enemy, player, 10, 0, 0, 0, 0));
        const result = resolveCombatRound(100, {0: player, 1: enemy});
        expect(result.events).toContainEqual({
            event: "damage",
            parent: expect.any(String),
            uuid: expect.any(String),
            target: 1,
            source: {character:0},
            value: Decimal(2)
        });
    });
    it("player does not take any damage from their own attacks", function(){
        getCharacter.mockReturnValueOnce(player)
            .mockReturnValueOnce(enemy);
        resolveAttack.mockReturnValueOnce(generateHitEvents(0, player, enemy, 10, 0, 0, 0, 0)
        ).mockReturnValueOnce(generateHitEvents(0, enemy, player, 10, 0, 0, 0, 0));
        const result = resolveCombatRound(100, {0: player, 1: enemy});
        expect(result.events).not.toContainEqual({
            event: "damage",
            parent: expect.any(String),
            uuid: expect.any(String),
            target: 0,
            source: {character:1},
            value: Decimal(2)
        });
    });
})