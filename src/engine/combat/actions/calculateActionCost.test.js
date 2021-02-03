import calculateActionCost from "./calculateActionCost";
import {Decimal} from "decimal.js";

describe("action cost energy calculation", function () {
    it("reduces based on precision attribute", function () {
        for(var i = 1; i <= 10; i++) {
            const cost = calculateActionCost({
                combat: {
                    precision: Decimal(i)
                }
                }, {
                primary: "basicAttack",
                enhancements: []
            },
                {})
            expect(cost).toEqual(Decimal(25 * Math.pow(.85, i)).floor());
        }
    })
})