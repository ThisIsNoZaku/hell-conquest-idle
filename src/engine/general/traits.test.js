import CharacterCombatState from "../CharacterCombatState";
import Decimal from "decimal.js";
import resolveCombatRound from "../combat/resolveCombatRound";
import * as _ from "lodash";
import {HitTypes} from "../../data/HitTypes";
import {Tactics} from "../../data/Tactics";
import {config, getConfigurationValue} from "../../config";

jest.mock("../index");

describe("traits", function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new CharacterCombatState({
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
                damage: Object.keys(HitTypes).reduce(((previousValue, currentValue) => {
                    previousValue[currentValue] = Decimal(HitTypes[currentValue].damageMultiplier * 10);
                    return previousValue;
                }), {}),
            },
            evasionPoints: 0
        }, 0);
        enemy = new CharacterCombatState({
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
                damage: Object.keys(HitTypes).reduce(((previousValue, currentValue) => {
                    previousValue[currentValue] = Decimal(HitTypes[currentValue].damageMultiplier * 10);
                    return previousValue;
                }), {}),
            },
            evasionPoints: 0
        }, 1);
    })
    it("bloodrage triggers on round end", function () {
        _.set(player, ["traits", "bloodrage"], 1);
        enemy.hp = Decimal(11);
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            initiativeOrder: [0, 1],
            tick: 100,
            events: [
                {
                    event: "hit",
                    hitType: 0,
                    uuid: expect.any(String),
                    children: [expect.any(String)],
                    timesDowngraded: 0,
                    timesUpgraded: 0,
                    evasionUsed: 0,
                    precisionUsed: 0,
                    source: 0,
                    target: 1
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
                    event: "hit",
                    uuid: expect.any(String),
                    children: [expect.any(String)],
                    hitType: 0,
                    timesUpgraded: 0,
                    timesDowngraded: 0,
                    evasionUsed: 0,
                    precisionUsed: 0,
                    source: 1,
                    target: 0,
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: 1,
                    target: 0,
                    value: Decimal(10)
                },
                {
                    event: "add-status",
                    source: 0,
                    target: 0,
                    duration: 1,
                    status: "berserk",
                    stacks: Decimal(1)
                }
            ]
        });
    });
    it("bloodrage removes stacks on round end if doesn't trigger", function () {
        _.set(player, ["traits", "bloodrage"], 1);
        player.statuses["berserk"] = [
            {
                source: 0,
                ranks: 1,
                duration: 1
            }
        ];
        enemy.maximumHp = Decimal(1000);
        enemy.hp = enemy.maximumHp;
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            tick: 100,
            initiativeOrder: [0, 1],
            events: [
                {
                    event: "hit",
                    uuid: expect.any(String),
                    children: [expect.any(String)],
                    hitType: 0,
                    timesUpgraded: 0,
                    timesDowngraded: 0,
                    evasionUsed: 0,
                    precisionUsed: 0,
                    source: 0,
                    target: 1
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
                    event: "hit",
                    uuid: expect.any(String),
                    children: [expect.any(String)],
                    hitType: 0,
                    evasionUsed: 0,
                    precisionUsed: 0,
                    timesUpgraded: 0,
                    timesDowngraded: 0,
                    source: 1,
                    target: 0,
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: 1,
                    target: 0,
                    value: Decimal(10)
                },
                {
                    event: "remove-status",
                    source: 0,
                    target: 0,
                    status: "berserk",
                    stacks: 999
                }
            ]
        });
    });
    it("inescapable grasp adds no stacks of restrained on glancing hit", function () {
        _.set(player, ["traits", "inescapableGrasp"], 1);
        enemy.evasionPoints = Decimal(200);
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toMatchObject({
            initiativeOrder: [0, 1],
            events: [
                {
                    event: "hit",
                    uuid: expect.any(String),
                    children: [expect.any(String)],
                    hitType: -1,
                    evasionUsed: Decimal(Tactics.defensive.modifiers.attack_downgrade_cost_multiplier * getConfigurationValue("mechanics.combat.incomingAttackDowngradeBaseCost")),
                    precisionUsed: 0,
                    timesUpgraded: 0,
                    timesDowngraded: 1,
                    source: 0,
                    target: 1
                },
                {
                    event: "damage",
                    source: 0,
                    target: 1,
                    value: Decimal(HitTypes[-1].damageMultiplier * 10).floor()
                },
                {
                    event: "hit",
                    uuid: expect.any(String),
                    children: [expect.any(String)],
                    hitType: 0,
                    evasionUsed: 0,
                    precisionUsed: 0,
                    timesUpgraded: 0,
                    timesDowngraded: 0,
                    source: 1,
                    target: 0,
                },
                {
                    event: "damage",
                    source: 1,
                    target: 0,
                    value: Decimal(10)
                }
            ]
        });
    });
    it("inescapable grasp adds stacks of restrained on serious hit", function () {
        _.set(player, ["traits", "inescapableGrasp"], 1);
        player.precisionPoints = Decimal(1000);
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            tick: 100,
            initiativeOrder: [0, 1],
            events: [
                {
                    event: "hit",
                    uuid: expect.any(String),
                    children: [
                        expect.any(String)
                    ],
                    hitType: 2,
                    source: 0,
                    target: 1,
                    timesUpgraded: 2,
                    timesDowngraded: 0,
                    precisionUsed: Decimal(100),
                    evasionUsed: 0
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: 0,
                    target: 1,
                    value: Decimal(20)
                },
                {
                    event: "add-status",
                    source: 0,
                    target: 1,
                    status: "restrained",
                    stacks: Decimal(1),
                    duration: 5
                },
                {
                    event: "hit",
                    uuid: expect.any(String),
                    children: [
                        expect.any(String)
                    ],
                    hitType: 0,
                    timesUpgraded: 0,
                    timesDowngraded: 0,
                    source: 1,
                    target: 0,
                    precisionUsed: 0,
                    evasionUsed: 0
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: 1,
                    target: 0,
                    value: Decimal(10)
                },
            ]
        });
    });
});