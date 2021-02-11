import {Character} from "../character";
import {Decimal} from "decimal.js";
import calculateActionCost from "../engine/combat/actions/calculateActionCost";
import {CombatActions} from "./CombatActions";
import {getConfigurationValue} from "../config";

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
            enhancements: ["flame"]
        }, player)).toEqual(Decimal((.85 + .5) * CombatActions.basicAttack.energyCostMultiplier * getConfigurationValue("attack_upgrade_cost_per_enemy_level")).ceil());
    });
    it("increases enemy defense enhancement modifier cost", function () {
        expect(calculateActionCost(enemy, {
            primary: "block",
            enhancements: ["arcane"]
        }, player)).toEqual(Decimal((.85 + .5) * CombatActions.block.energyCostMultiplier * getConfigurationValue("attack_downgrade_cost_per_enemy_level")).floor());
    });
})