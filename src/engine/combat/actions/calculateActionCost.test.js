import {calculateActionCost} from "./calculateActionCost";
import {Decimal} from "decimal.js";
import {getConfigurationValue} from "../../../config";

describe("action cost energy calculation", function () {
    it("reduces based on precision attribute", function () {
        for (var i = 1; i <= 10; i++) {
            const cost =calculateActionCost({
                    traits: {},
                    combat: {
                        precision: Decimal(i)
                    },
                    attackActionAttributeMultiplier: Decimal(Math.pow(0.95, i)),
                    defenseActionAttributeMultiplier: Decimal(Math.pow(0.95, i))
                }, {
                    primary: "basicAttack",
                    enhancements: []
                },
                {traits: {}});
            console.log(i);
            expect(cost)
                .toEqual(Decimal(getConfigurationValue("attack_upgrade_cost_per_enemy_level") * Math.pow(1 - getConfigurationValue("precision_effect_per_point"), i)).floor());
        }
    });
});