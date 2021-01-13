import resolveCombat from "./resolveCombat";
import {Decimal} from "decimal.js";
import {Character} from "../../character";

jest.mock("../index");

describe("combat resolution", function () {
    let player, enemy;
    beforeEach(() => {
        player = new Character({
            id: 0,
            isPc: true,
            absorbedPower: 0,
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            traits: {}
        });
        enemy = new Character({
            id: 1,
            absorbedPower: 0,
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            traits: {}
        });
    });
    it("repeatedly resolves until a party loses", function () {
        const combatResult = resolveCombat([[player], [enemy]]);
        expect(combatResult).toEqual({
            0: {
                tick: 0,
                events: []
            },
            100: {
                initiativeOrder: [0, 1],
                tick: 100,
                end: false,
                events: [
                    {
                        event: "hit",
                        uuid: expect.any(String),
                        children: [
                            expect.any(String)
                        ],
                        source: 0,
                        target: 1,
                        hitType: 0,
                        timesUpgraded: 0,
                        timesDowngraded: 0,
                        evasionUsed: 0,
                        precisionUsed: 0
                    },
                    {
                        event: "damage",
                        source: 0,
                        uuid: expect.any(String),
                        parent: expect.any(String),
                        target: 1,
                        value: Decimal(10)
                    },
                    {
                        event: "hit",
                        uuid: expect.any(String),
                        children: [
                            expect.any(String)
                        ],
                        source: 1,
                        target: 0,
                        hitType: 0,
                        timesUpgraded: 0,
                        timesDowngraded: 0,
                        evasionUsed: 0,
                        precisionUsed: 0
                    },
                    {
                        event: "damage",
                        uuid: expect.any(String),
                        parent: expect.any(String),
                        source: 1,
                        target: 0,
                        value: Decimal(10)
                    }
                ]
            },
            200: {
                initiativeOrder: [0, 1],
                tick: 200,
                end: true,
                events: [
                    {
                        event: "hit",
                        uuid: expect.any(String),
                        children: [
                            expect.any(String)
                        ],
                        source: 0,
                        target: 1,
                        hitType: 0,
                        timesUpgraded: 0,
                        timesDowngraded: 0,
                        evasionUsed: 0,
                        precisionUsed: 0
                    },
                    {
                        event: "damage",
                        uuid: expect.any(String),
                        parent: expect.any(String),
                        source: 0,
                        target: 1,
                        value: Decimal(10)
                    },
                    {
                        event: "kill",
                        source: 0,
                        target: 1
                    }
                ]
            },
        })
    });
    it("causes fatigue damage when combat lasts too long", function () {
        player.hp = Decimal(1000);
        enemy.hp = Decimal(1000);
        const combatResult = resolveCombat([[player], [enemy]]);
        expect(combatResult).toEqual({
            0: {
                tick: 0,
                events: []
            },
            100: {
                end: false,
                initiativeOrder: [0, 1],
                tick: 100,
                events: [
                    {
                        event: "hit",
                        children: [
                            expect.any(String)
                        ],
                        source: 0,
                        target: 1,
                        uuid: expect.any(String),
                        hitType: 0,
                        timesUpgraded: 0,
                        timesDowngraded: 0,
                        evasionUsed: 0,
                        precisionUsed: 0
                    },
                    {
                        event: "damage",
                        source: 0,
                        target: 1,
                        uuid: expect.any(String),
                        parent: expect.any(String),
                        value: Decimal(10)
                    },
                    {
                        event: "hit",
                        children: [
                            expect.any(String)
                        ],
                        uuid: expect.any(String),
                        source: 1,
                        target: 0,
                        hitType: 0,
                        timesUpgraded: 0,
                        timesDowngraded: 0,
                        evasionUsed: 0,
                        precisionUsed: 0
                    },
                    {
                        event: "damage",
                        source: 1,
                        target: 0,
                        uuid: expect.any(String),
                        parent: expect.any(String),
                        value: Decimal(10)
                    }
                ]
            },
            200: {
                initiativeOrder: [0, 1],
                tick: 200,
                end: true,
                events: [
                    {
                        event: "hit",
                        children: [
                            expect.any(String)
                        ],
                        uuid: expect.any(String),
                        source: 0,
                        target: 1,
                        hitType: 0,
                        timesUpgraded: 0,
                        timesDowngraded: 0,
                        evasionUsed: 0,
                        precisionUsed: 0
                    },
                    {
                        event: "damage",
                        source: 0,
                        target: 1,
                        uuid: expect.any(String),
                        parent: expect.any(String),
                        value: Decimal(10)
                    },
                    {
                        event: "kill",
                        source: 0,
                        target: 1
                    }
                ]
            },
        })
    });
})