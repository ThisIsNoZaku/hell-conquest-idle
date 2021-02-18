import {calculateActionCost} from "./calculateActionCost";
import {Decimal} from "decimal.js";
import {getConfigurationValue} from "../../../config";

describe("action cost energy calculation", function () {
    it("reduces based on precision attribute", function () {
        for(var i = 1; i <= 10; i++) {
            const cost = calculateActionCost({
                traits: {},
                combat: {
                    precision: Decimal(i)
                }
                }, {
                primary: "basicAttack",
                enhancements: []
            },
                {traits: {}})
            expect(cost).toEqual(Decimal(getConfigurationValue("attack_upgrade_cost_per_enemy_level") * Math.pow(.85, i)).floor());
        }
    });
});