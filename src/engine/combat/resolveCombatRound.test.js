import resolveCombatRound from "./resolveCombatRound";
import Decimal from "decimal.js";
import {HitTypes} from "../../data/HitTypes";
import {Character} from "../../character";
import {getConfigurationValue} from "../../config";

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
        player.combat.stamina = Decimal(26);
        enemy.combat.stamina = Decimal(26);
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            initiativeOrder: [0, 1],
            tick: 100,
            end: false,
            events: [
                {
                    event: "attack",
                    uuid: expect.any(String),
                    children: [expect.any(String)],
                    source: {
                        character: 0
                    },
                    target: 1,
                    evasionUsed: Decimal(0),
                    precisionUsed: Decimal(0),
                    timesUpgraded: 0,
                    timesDowngraded: 0,
                    hit: true,
                    hitType: 0
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: {
                        character: 0
                    },
                    target: 1,
                    value: Decimal(10),
                },
                {
                    event: "attack",
                    uuid: expect.any(String),
                    children: [expect.any(String)],
                    source: {
                        character: 1
                    },
                    target: 0,
                    evasionUsed: Decimal(0),
                    precisionUsed: Decimal(0),
                    timesUpgraded: 0,
                    timesDowngraded: 0,
                    hit: true,
                    hitType: 0
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: {
                        character: 1
                    },
                    target: 0,
                    value: Decimal(10),
                }
            ]
        })
    });
    it("when attacker can upgrade and the enemy cannot downgrade, the attack scores a Critical Hit", function () {
        enemy.combat.stamina = Decimal(0);

        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            initiativeOrder: [0, 1],
            end: false,
            events: [
                {
                    event: "attack",
                    source: {
                        character: 0
                    },
                    target: 1,
                    uuid: expect.any(String),
                    children: [expect.any(String)],
                    precisionUsed: Decimal(95),
                    evasionUsed: Decimal(0),
                    timesUpgraded: 1,
                    timesDowngraded: 0,
                    hit: true,
                    hitType: 1
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: {
                        character: 0
                    },
                    target: 1,
                    value: Decimal(Math.floor(HitTypes[1].damageMultiplier * 10))
                },
                {
                    event: "attack",
                    uuid: expect.any(String),
                    children: [],
                    source: {
                        character: 1
                    },
                    target: 0,
                    hitType: -1,
                    timesUpgraded: 0,
                    timesDowngraded: 1,
                    evasionUsed: Decimal(72),
                    hit: false,
                    precisionUsed: Decimal(0)
                },
                {
                    event: "fatigue-damage",
                    source: {
                        character: 1
                    },
                    target: 1,
                    uuid: expect.any(String),
                    value: Decimal(4)
                }
            ],
            tick: 100
        })
    });
    it("when attacker is using Aggressive tactics, the attack upgrade costs 75 points", function () {
        enemy.combat.stamina = Decimal(0);

        player.tactics = "aggressive";

        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            initiativeOrder: [0, 1],
            end: false,
            events: [
                {
                    event: "attack",
                    uuid: expect.any(String),
                    children: [expect.any(String)],
                    source: {
                        character: 0
                    },
                    target: 1,
                    hit: true,
                    precisionUsed: Decimal(72),
                    evasionUsed: Decimal(0),
                    hitType: 1,
                    timesUpgraded: 1,
                    timesDowngraded: 0,
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: {
                        character: 0
                    },
                    target: 1,
                    value: Decimal(HitTypes[1].damageMultiplier * 10),
                },
                {
                    event: "attack",
                    uuid: expect.any(String),
                    children: [],
                    source: {
                        character: 1
                    },
                    target: 0,
                    hit: false,
                    precisionUsed: Decimal(0),
                    evasionUsed: Decimal(95),
                    hitType: -1,
                    timesUpgraded: 0,
                    timesDowngraded: 1,
                },
                {
                    event: "fatigue-damage",
                    uuid: expect.any(String),
                    source: {
                        character: 1
                    },
                    target: 1,
                    value: Decimal(4)
                }
            ],
            tick: 100
        })
    });
    it("when target has enough stamina to spend, they downgrade a Solid Hit to a Miss", function () {
        enemy.combat.stamina = Decimal(125);

        player.combat.stamina = Decimal(25);
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            initiativeOrder: [0, 1],
            end: false,
            events: [
                {
                    event: "attack",
                    uuid: expect.any(String),
                    children: [],
                    source: {
                        character: 0
                    },
                    target: 1,
                    evasionUsed: Decimal(72),
                    precisionUsed: Decimal(0),
                    timesDowngraded: 1,
                    timesUpgraded: 0,
                    hit: false,
                    hitType: -1
                },
                {
                    event: "attack",
                    uuid: expect.any(String),
                    children: [
                        expect.any(String)
                    ],
                    source: {
                        character: 1
                    },
                    target: 0,
                    evasionUsed: Decimal(0),
                    precisionUsed: Decimal(0),
                    timesDowngraded: 0,
                    timesUpgraded: 0,
                    hit: true,
                    hitType: 0
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: {
                        character: 1
                    },
                    target: 0,
                    value: Decimal(10)
                }
            ],
            tick: 100
        })
    });
    it("when attacker has enough Precision to upgrade an attack and target has enough Evasion to downgrade attack, the result is a Solid Hit", function () {
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            initiativeOrder: [0, 1],
            end: false,
            events: [
                {
                    event: "attack",
                    uuid: expect.any(String),
                    children: [
                        expect.any(String)
                    ],
                    source: {
                        character: 0
                    },
                    target: 1,
                    evasionUsed: Decimal(72),
                    precisionUsed: Decimal(95),
                    timesDowngraded: 1,
                    timesUpgraded: 1,
                    hitType: 0,
                    hit: true,
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: {
                        character: 0
                    },
                    target: 1,
                    value: Decimal(Math.floor(10)),
                },
                {
                    event: "attack",
                    uuid: expect.any(String),
                    children: [
                        expect.any(String)
                    ],
                    source: {
                        character: 1
                    },
                    target: 0,
                    evasionUsed: Decimal(72),
                    precisionUsed: Decimal(95),
                    timesDowngraded: 1,
                    timesUpgraded: 1,
                    hit: true,
                    hitType: 0
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: {
                        character: 1
                    },
                    target: 0,
                    value: Decimal(10)
                }
            ],
            tick: 100
        })
    });
    it("when target uses Deceptive tactics, the cost to downgrade an attack is 50% higher", function () {
        enemy.tactics = "deceptive";

        player.tactics = "aggressive";
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        expect(combatResults).toEqual({
            initiativeOrder: [0, 1],
            end: false,
            events: [
                {
                    event: "attack",
                    uuid: expect.any(String),
                    hit: false,
                    children: [],
                    source: {
                        character: 0
                    },
                    target: 1,
                    precisionUsed: Decimal(72),
                    evasionUsed: Decimal(141).floor(),
                    timesUpgraded: 1,
                    timesDowngraded: 2,
                    hitType: -1
                },
                {
                    event: "attack",
                    uuid: expect.any(String),
                    children: [
                        expect.any(String)
                    ],
                    hit: true,
                    source: {
                        character: 1
                    },
                    target: 0,
                    precisionUsed: Decimal(94),
                    evasionUsed: Decimal(95),
                    timesUpgraded: 1,
                    timesDowngraded: 1,
                    hitType: 0
                },
                {
                    event: "damage",
                    uuid: expect.any(String),
                    parent: expect.any(String),
                    source: {
                        character: 1
                    },
                    target: 0,
                    value: Decimal(10)
                }
            ],
            tick: 100
        })
    });
    it("consumes stamina each round", function () {
        const staminaConsumedPerRound = getConfigurationValue("stamina_consumed_per_round");
        const combatResults = resolveCombatRound(100, {0: player, 1: enemy});
        const playerAttackStaminaUsed = combatResults.events.find(e => e.source.character === 0 && e.event === "attack").precisionUsed;
        const playerDefenseStaminaUsed = combatResults.events.find(e => e.target === 0 && e.event === "attack").evasionUsed;

        const enemyAttackStaminaUsed = combatResults.events.find(e => e.source.character === 1 && e.event === "attack").precisionUsed;
        const enemyDefenseStaminaUsed = combatResults.events.find(e => e.target === 1 && e.event === "attack").evasionUsed

        expect(player.combat.stamina).toEqual(player.combat.maximumStamina.minus(staminaConsumedPerRound).minus(playerAttackStaminaUsed).minus(playerDefenseStaminaUsed));
        expect(enemy.combat.stamina).toEqual(enemy.combat.maximumStamina.minus(staminaConsumedPerRound).minus(enemyAttackStaminaUsed).minus(enemyDefenseStaminaUsed));
    })
});