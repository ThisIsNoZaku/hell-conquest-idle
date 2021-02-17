import {Character} from "../character";
import {Decimal} from "decimal.js";
import calculateActionCost from "../engine/combat/actions/calculateActionCost";
import {CombatActions} from "./CombatActions";
import {getConfigurationValue} from "../config";
import resolveAction from "../engine/combat/actions/resolveAction";
import resolveCombatRound from "../engine/combat/resolveCombatRound";
import {getCharacter} from "../engine";

jest.mock("../engine");

describe("neutralizing status", function () {
    let enemy;
    let player;
    beforeEach(() => {
        player = new Character({
            id: 0,
            statuses: {
                neutralizing: [
                    {
                        stacks: Decimal(1)
                    }
                ]
            }
        });
        enemy = new Character({
            id: 1
        });
    })
    it("increases enemy attack enhancement modifier cost", function () {
        expect(calculateActionCost(enemy, {
            primary: "basicAttack",
            enhancements: [
                {enhancement: "flame", sourceTrait: "1"},
                {enhancement: "venom", sourceTrait: "2"}
            ]
        }, player)).toEqual(Decimal((.85 + .7) * CombatActions.basicAttack.energyCostMultiplier * getConfigurationValue("attack_upgrade_cost_per_enemy_level")).ceil());
    });
    it("increases multiple enemy together", function () {
        expect(calculateActionCost(enemy, {
            primary: "basicAttack",
            enhancements: [{enhancement: "flame", sourceTrait: "test"}]
        }, player)).toEqual(Decimal((.85 + .35) * CombatActions.basicAttack.energyCostMultiplier * getConfigurationValue("attack_upgrade_cost_per_enemy_level")).ceil());
    });
    it("increases enemy defense enhancement modifier cost", function () {
        expect(calculateActionCost(enemy, {
            primary: "block",
            enhancements: [{enhancement: "arcane", sourceTrait: "test"}]
        }, player)).toEqual(Decimal((.85 + .35) * CombatActions.block.energyCostMultiplier * getConfigurationValue("attack_downgrade_cost_per_enemy_level")).floor());
    });
});

describe("untouchable status", function () {
    let enemy;
    let player;
    beforeEach(() => {
        player = new Character({
            id: 0,
            statuses: {
                untouchable: [
                    {
                        stacks: Decimal(1),
                        source: {
                            character: 0
                        }
                    }
                ]
            }
        });
        enemy = new Character({
            id: 1
        });
        getCharacter.mockImplementation(id => {
            switch (id) {
                case 0:
                    return player;
                case 1:
                    return enemy;
            }
        })
    })
    it("makes you immune to non-ranged attacks", function () {
        enemy.combat.energy = Decimal(200);
        const result = resolveCombatRound(100, {0: player, 1: enemy});
        expect(result).toEqual({
            end: false,
            events: [
                {
                    event: "action-skipped",
                    reason: ", could not reach the enemy.",
                    source: {
                        character: 1
                    },
                    tick: 100,
                    uuid: expect.any(String)
                },
                {
                    event: "action-skipped",
                    reason: "to gain energy",
                    source: {
                        character: 0
                    },
                    tick: 100,
                    uuid: expect.any(String)
                },
                {
                    event: "remove-status",
                    source: {
                        character: 0
                    },
                    stacks: 1,
                    status: "untouchable",
                    target: 0,
                    toRemove: undefined,
                    uuid: expect.any(String)
                }
            ],
            initiativeOrder: [1, 0],
            tick: 100,
        });
    });
})