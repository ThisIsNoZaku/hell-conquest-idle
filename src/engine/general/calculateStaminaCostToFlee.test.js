import calculateStaminaCostToFlee from "./calculateStaminaCostToFlee";
import {Decimal} from "decimal.js";

describe("escape stamina cost calculation", function () {
    it("costs 1 to flee from equal level enemy", function () {
        const cost = calculateStaminaCostToFlee({
            powerLevel: Decimal(1),
        }, {
            powerLevel: Decimal(1),
        });
        expect(cost).toEqual(Decimal(5));
    });
    it("costs stamina equal to 5 minus level difference", function () {
        for(let i = 0; i < 5; i++) {
            const cost = calculateStaminaCostToFlee({
                powerLevel: Decimal(1),
            }, {
                powerLevel: Decimal(i + 1),
            });
            expect(cost).toEqual(Decimal(5 - i));
        }
    })
});