import resolveCombatRound from "./resolveCombatRound";
import Decimal from "decimal.js";
import CharacterCombatState from "../CharacterCombatState";

jest.mock("../index");

describe('The combat round resolution', function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new CharacterCombatState({
            isPc: true,
            id: 0,
            hp: 50,
            powerLevel: 1,
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                damage: {
                    min: Decimal(Math.floor(5 * .8)),
                    med: Decimal(5),
                    max: Decimal(Math.floor(5 * 1.2))
                },
            },
            evasionPoints: 0
        }, 0);
        enemy = new CharacterCombatState({
            id: 1,
            hp: 25,
            powerLevel: 1,
            attributes: {
                baseBrutality: 1,
                baseCunning: 1,
                baseDeceit: 1,
                baseMadness: 1
            },
            combat: {
                damage: {
                    min: Decimal(Math.floor(5 * .8)),
                    med: Decimal(5),
                    max: Decimal(Math.floor(5 * 1.2))
                },
            },
            evasionPoints: 0
        }, 1);
    })
    it("when characters have no evasion or precision points, the characters land solid hits.", function () {
        const combatResults = resolveCombatRound(100, {
            combatants: {
                0: player,
                1: enemy
            }
        });
        expect(combatResults).toMatchObject({
            initiativeOrder: [0, 1],
            characters: {
                0: {
                    id: 0,
                    isPc: true,
                    hp: 50
                },
                1: {
                    id: 1,
                    hp: 25
                }
            },
            events: [
                {
                    event: "hit",
                    actor: 0,
                    targets: [1],
                    tick: 100,
                    effects: [
                        {
                            type: "damage",
                            source: 0,
                            target: 1,
                            value: Decimal(5),
                        }
                    ],
                    hitType: "solid"
                },
                {
                    event: "hit",
                    actor: 1,
                    targets: [0],
                    tick: 100,
                    effects: [
                        {
                            type: "damage",
                            source: 1,
                            target: 0,
                            value: Decimal(5),
                        }
                    ],
                    hitType: "solid"
                }
            ]
        })
    });
    it("when attacker has more Precision points than the attacker has Evasion and enough precision points to spend, they score a Critical Hit", function () {
        player.precisionPoints = Decimal(200);
        const combatResults = resolveCombatRound(100, {
            combatants: {
                0: player,
                1: enemy
            }
        });
        expect(combatResults).toMatchObject({
            initiativeOrder: [0, 1],
            characters: {
                0: {
                    id: 0,
                    isPc: true,
                    hp: 50,
                    attackUpgradeCost: Decimal(200),
                    precisionPoints: Decimal(0),
                    evasionPoints: Decimal(0),
                    party: 0,
                    damage: player.damage
                },
                1: {
                    id: 1,
                    hp: 25,
                    attackUpgradeCost: Decimal(200),
                    precisionPoints: Decimal(0),
                    evasionPoints: Decimal(0),
                    party: 1,
                    damage: enemy.damage
                }
            },
            events: [
                {
                    event: "hit",
                    actor: 0,
                    targets: [1],
                    tick: 100,
                    effects: [
                        {
                            type: "damage",
                            source: 0,
                            target: 1,
                            value: Decimal(Math.floor(5 * 1.2)),
                        }
                    ],
                    hitType: "critical"
                },
                {
                    event: "hit",
                    actor: 1,
                    targets: [0],
                    tick: 100,
                    effects: [
                        {
                            type: "damage",
                            source: 1,
                            target: 0,
                            value: Decimal(5)
                        }
                    ],
                    hitType: "solid"
                }
            ],
            tick: 100
        })
    });
    it("when target has enough Evasion to spend, they downgrade a Solid Hit to a Glancing Hit", function () {
        enemy.evasionPoints = Decimal(200);
        const combatResults = resolveCombatRound(100, {
            combatants: {
                0: player,
                1: enemy
            }
        });
        expect(combatResults).toMatchObject({
            initiativeOrder: [0, 1],
            characters: {
                0: {
                    id: 0,
                    isPc: true,
                    hp: 50,
                    attackUpgradeCost: Decimal(200),
                    incomingAttackDowngradeCost: Decimal(200),
                    precisionPoints: Decimal(0),
                    evasionPoints: Decimal(0),
                    party: 0,
                    damage: {
                        min: Decimal(4),
                        med: Decimal(5),
                        max: Decimal(6)
                    }
                },
                1: {
                    id: 1,
                    hp: 25,
                    attackUpgradeCost: Decimal(200),
                    incomingAttackDowngradeCost: Decimal(200),
                    precisionPoints: Decimal(0),
                    evasionPoints: Decimal(0),
                    party: 1,
                    damage: {
                        min: Decimal(4),
                        med: Decimal(5),
                        max: Decimal(6)
                    }
                }
            },
            events: [
                {
                    event: "hit",
                    actor: 0,
                    targets: [1],
                    tick: 100,
                    effects: [
                        {
                            type: "damage",
                            source: 0,
                            target: 1,
                            value: Decimal(Math.floor(5 * 0.8)),
                        }
                    ],
                    hitType: "glancing"
                },
                {
                    event: "hit",
                    actor: 1,
                    targets: [0],
                    tick: 100,
                    effects: [
                        {
                            type: "damage",
                            source: 1,
                            target: 0,
                            value: Decimal(5)
                        }
                    ],
                    hitType: "solid"
                }
            ],
            tick: 100
        })
    });
});