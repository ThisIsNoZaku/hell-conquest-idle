import Decimal from "decimal.js";
import resolveCombatRound from "../combat/resolveCombatRound";
import * as _ from "lodash";
import {HitTypes} from "../../data/HitTypes";
import {Tactics} from "../../data/Tactics";
import {getConfigurationValue} from "../../config";
import {Character} from "../../character";

jest.mock("../index");
jest.mock("../combat/resolveAttack");
const resolveAttackMock = jest.requireMock("../combat/resolveAttack").default;

describe("traits", function () {
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
    it("bloodrage triggers on round end", function () {
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
    it("bloodrage removes stacks on round end if doesn't trigger", function () {
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
describe("inescapeable grasp trait", function () {
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
    it("inescapable grasp adds no stacks of restrained on glancing hit", function () {
        _.set(player, ["traits", "inescapableGrasp"], 1);
        enemy.combat.evasionPoints = Decimal(200);
        enemy.combat.precisionPoints = Decimal(0);

        player.combat.evasionPoints = Decimal(0);
        player.combat.precisionPoints = Decimal(0);
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toMatchObject({
            initiativeOrder: [0, 1],
            events: []
        });
    });
    it("inescapable grasp adds stacks of restrained on serious hit", function () {
        resolveAttackMock.mockClear();
        resolveAttackMock.mockReturnValue({
            effects: [],
            hitType: 1,
        });
        _.set(player, ["traits", "inescapableGrasp"], 1);
        enemy.combat.evasionPoints = Decimal(0);
        enemy.combat.precisionPoints = Decimal(0);

        player.combat.precisionPoints = Decimal(200);
        player.combat.evasionPoints = Decimal(0);
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            tick: 100,
            end: false,
            initiativeOrder: [0, 1],
            events: [
                {
                    event: "add-status",
                    source: 0,
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