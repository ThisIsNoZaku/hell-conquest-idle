import Decimal from "decimal.js";
import resolveCombatRound from "../combat/resolveCombatRound";
import * as _ from "lodash";
import {HitTypes} from "../../data/HitTypes";
import {Tactics} from "../../data/Tactics";
import {getConfigurationValue} from "../../config";
import {Character} from "../../character";
import triggerEvent from "./triggerEvent";
import calculateDamageBy from "../combat/calculateDamageBy";

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
                duration: 999,
                uuid: expect.any(String)
            }]
        });
    });
    it("removes stacks on round end if doesn't trigger", function () {
        _.set(player, ["traits", "bloodrage"], 1);
        player.statuses["berserk"] = [
            {
                source: {
                    character: 0,
                    trait: "bloodrage"
                },
                stacks: 1,
                duration: 999,
                uuid: "1234567890"
            },
            {
                source: {
                    character: 0,
                    trait: "other"
                },
                stacks: 1,
                duration: 999,
                uuid: "2345678901"
            }
        ];
        enemy.combat.evasionPoints = Decimal(0);
        enemy.combat.precisionPoints = Decimal(0);

        player.combat.evasionPoints = Decimal(0);
        player.combat.precisionPoints = Decimal(0);
        enemy.powerLevel = Decimal(10);
        enemy.hp = enemy.maximumHp;
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            tick: 100,
            end: false,
            initiativeOrder: [0, 1],
            events: [
                {
                    event: "remove-status",
                    source: 0,
                    target: 0,
                    toRemove: "1234567890",
                    status: "berserk",
                    stacks: 999
                }
            ]
        });
        expect(player.statuses["berserk"]).toEqual([
            {
                source: {
                    character: 0,
                    trait: "other"
                },
                stacks: 1,
                duration: 999,
                uuid: "2345678901"
            }
        ])
    });
})
describe("cannibalism trait", function () {
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
                cannibalism: 1
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
            source: player,
            target: enemy,
            combatants: {0: player, 1: enemy},
            roundEvents: []
        });
        expect(player.statuses["engorged"])
            .toEqual([
                {
                    duration: 999,
                    uuid: expect.any(String),
                    source: {
                        character: 0,
                        trait: "cannibalism"
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
                    trait: "cannibalism"
                },
                stacks: Decimal(1),
                uuid: "1234567890"
            }
        ]

        triggerEvent({
            type: "on_kill",
            source: player,
            target: enemy,
            combatants: {0: player, 1: enemy},
            roundEvents: []
        });
        expect(player.statuses["engorged"])
            .toEqual([
                {
                    duration: 999,
                    uuid: expect.any(String),
                    source: {
                        character: 0,
                        trait: "cannibalism"
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
                    trait: "cannibalism"
                },
                duration: 999,
                uuid: "1234567890"
            }
        ]
        triggerEvent({
            type: "on_kill",
            source: player,
            target: enemy,
            combatants: {0: player, 1: enemy},
            roundEvents: []
        });
        expect(player.statuses["engorged"])
            .toEqual([
                {
                    duration: 999,
                    uuid: expect.any(String),
                    source: {
                        character: 0,
                        trait: "cannibalism"
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
                    duration: 5
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