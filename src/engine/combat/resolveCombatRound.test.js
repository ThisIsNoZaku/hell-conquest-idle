import resolveCombatRound from "./resolveCombatRound";
import Decimal from "decimal.js";
import {HitTypes} from "../../data/HitTypes";
import {Character} from "../../character";

jest.mock("../index");

describe('The combat round resolution', function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new Character({
            isPc: true,
            id: 0,
            hp: Decimal(50),
            tactics: "defensive",
            powerLevel: 1,
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            }
        }, 0);
        enemy = new Character({
            id: 1,
            hp: Decimal(50),
            powerLevel: 1,
            tactics: "defensive",
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            }
        }, 1);
    })
    it("when characters have no evasion or precision points, the characters land solid hits.", function () {
        enemy.combat.evasionPoints = Decimal(0);
        enemy.combat.precisionPoints = Decimal(0);

        player.combat.precisionPoints = Decimal(0);
        player.combat.evasionPoints = Decimal(0);
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            initiativeOrder: [0, 1],
            tick: 100,
            end: false,
            events: [
                {
                    event: "hit",
                    uuid: expect.any(String),
                    children: [expect.any(String)],
                    source: 0,
                    target: 1,
                    evasionUsed: Decimal(0),
                    precisionUsed: Decimal(0),
                    timesUpgraded: 0,
                    timesDowngraded: 0,
                    hitType: 0
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: 0,
                    target: 1,
                    value: Decimal(10),
                },
                {
                    event: "hit",
                    uuid: expect.any(String),
                    children: [expect.any(String)],
                    source: 1,
                    target: 0,
                    evasionUsed: Decimal(0),
                    precisionUsed: Decimal(0),
                    timesUpgraded: 0,
                    timesDowngraded: 0,
                    hitType: 0
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: 1,
                    target: 0,
                    value: Decimal(10),
                }
            ]
        })
    });
    it("when attacker has more Precision points than the attacker has Evasion and enough precision points to spend, they score a Critical Hit", function () {
        enemy.combat.evasionPoints = Decimal(0);
        enemy.combat.precisionPoints = Decimal(0);

        player.combat.precisionPoints = Decimal(200);
        player.combat.evasionPoints = Decimal(0);
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            initiativeOrder: [0, 1],
            end: false,
            events: [
                {
                    event: "hit",
                    source: 0,
                    target: 1,
                    uuid: expect.any(String),
                    children: [expect.any(String)],
                    precisionUsed: Decimal(100),
                    evasionUsed: Decimal(0),
                    timesUpgraded: 1,
                    timesDowngraded: 0,
                    hitType: 1
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: 0,
                    target: 1,
                    value: Decimal(Math.floor(HitTypes[1].damageMultiplier * 10))
                },
                {
                    event: "hit",
                    uuid: expect.any(String),
                    children: [expect.any(String)],
                    source: 1,
                    target: 0,
                    hitType: 0,
                    timesUpgraded: 0,
                    timesDowngraded: 0,
                    evasionUsed: Decimal(0),
                    precisionUsed: Decimal(0)
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: 1,
                    target: 0,
                    value: Decimal(10)
                }
            ],
            tick: 100
        })
    });
    it("when attacker is using Aggressive tactics, the attack upgrade costs 50 points", function () {
        enemy.combat.evasionPoints = Decimal(0);
        enemy.combat.precisionPoints = Decimal(0);

        player.combat.precisionPoints = Decimal(200);
        player.combat.evasionPoints = Decimal(0);
        player.tactics = "aggressive";

        const combatResults = resolveCombatRound(100, {0: player, 1:enemy});
        expect(combatResults).toEqual({
            initiativeOrder: [0, 1],
            end: false,
            events: [
                {
                    event: "hit",
                    uuid: expect.any(String),
                    children: [expect.any(String)],
                    source: 0,
                    target: 1,
                    precisionUsed: Decimal(50),
                    evasionUsed: Decimal(0),
                    hitType: 1,
                    timesUpgraded: 1,
                    timesDowngraded: 0,
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: 0,
                    target: 1,
                    value: Decimal(HitTypes[1].damageMultiplier * 10),
                },
                {
                    event: "hit",
                    uuid: expect.any(String),
                    children: [expect.any(String)],
                    source: 1,
                    target: 0,
                    precisionUsed: Decimal(0),
                    evasionUsed: Decimal(0),
                    hitType: 0,
                    timesUpgraded: 0,
                    timesDowngraded: 0,
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: 1,
                    target: 0,
                    value: Decimal(10)
                }
            ],
            tick: 100
        })
    });
    it("when target has enough Evasion to spend, they downgrade a Solid Hit to a Glancing Hit", function () {
        enemy.combat.evasionPoints = Decimal(200);
        enemy.combat.precisionPoints = Decimal(0);

        player.combat.evasionPoints = Decimal(0);
        player.combat.precisionPoints = Decimal(0);
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            initiativeOrder: [0, 1],
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
                    evasionUsed: Decimal(75),
                    precisionUsed: Decimal(0),
                    timesDowngraded: 1,
                    timesUpgraded: 0,
                    hitType: -1
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: 0,
                    target: 1,
                    value: Decimal(HitTypes[-1].damageMultiplier * 10),
                },
                {
                    event: "hit",
                    uuid: expect.any(String),
                    children: [
                        expect.any(String)
                    ],
                    source: 1,
                    target: 0,
                    evasionUsed: Decimal(0),
                    precisionUsed: Decimal(0),
                    timesDowngraded: 0,
                    timesUpgraded: 0,
                    hitType: 0
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: 1,
                    target: 0,
                    value: Decimal(10)
                }
            ],
            tick: 100
        })
    });
    it("when attacker has enough Precision to upgrade an attack and target has enough Evasion to downgrade attack, the result is a Solid Hit", function () {
        enemy.combat.evasionPoints = Decimal(200);
        enemy.combat.precisionPoints = Decimal(0);

        player.combat.precisionPoints = Decimal(300);
        player.combat.evasionPoints = Decimal(0);
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            initiativeOrder: [0, 1],
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
                    evasionUsed: Decimal(75),
                    precisionUsed: Decimal(100),
                    timesDowngraded: 1,
                    timesUpgraded: 1,
                    hitType: 0
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: 0,
                    target: 1,
                    value: Decimal(Math.floor(10)),
                },
                {
                    event: "hit",
                    uuid: expect.any(String),
                    children: [
                        expect.any(String)
                    ],
                    source: 1,
                    target: 0,
                    evasionUsed: Decimal(0),
                    precisionUsed: Decimal(0),
                    timesDowngraded: 0,
                    timesUpgraded: 0,
                    hitType: 0
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: 1,
                    target: 0,
                    value: Decimal(10)
                }
            ],
            tick: 100
        })
    });
    it("when target uses Deceptive tactics, the cost to downgrade an attack is 50% higher", function () {
        enemy.combat.precisionPoints = Decimal(0);
        enemy.combat.evasionPoints = Decimal(300);
        enemy.tactics = "deceptive";

        player.combat.precisionPoints = Decimal(500);
        player.combat.evasionPoints = Decimal(0);
        player.tactics = "aggressive";
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            initiativeOrder: [0, 1],
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
                    precisionUsed: Decimal(50),
                    evasionUsed: Decimal(100),
                    timesUpgraded: 1,
                    timesDowngraded: 2,
                    hitType: -1
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: 0,
                    target: 1,
                    value: Decimal(HitTypes[-1].damageMultiplier * 10),
                },
                {
                    event: "hit",
                    uuid: expect.any(String),
                    children: [
                        expect.any(String)
                    ],
                    source: 1,
                    target: 0,
                    precisionUsed: Decimal(0),
                    evasionUsed: Decimal(0),
                    timesUpgraded: 0,
                    timesDowngraded: 0,
                    hitType: 0
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: 1,
                    target: 0,
                    value: Decimal(10)
                }
            ],
            tick: 100
        })
    });
});