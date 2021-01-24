import calculateStaminaCostToFlee from "./calculateStaminaCostToFlee";
import {Decimal} from "decimal.js";

describe("escape stamina cost calculation", function () {
    it("costs 1 to flee from equal level enemy", function () {
        const cost = calculateStaminaCostToFlee({
            powerLevel: Decimal(1),
            attributes: {
                deceit: 1
            }
        }, {
            powerLevel: Decimal(1),
        });
        expect(cost).toEqual(Decimal(25 * .95).ceil());
    });
    it("costs stamina equal to 5 minus level difference", function () {
        for (let i = 0; i < 5; i++) {
            const cost = calculateStaminaCostToFlee({
                powerLevel: Decimal(1),
                attributes: {
                    deceit: 1
                }
            }, {
                powerLevel: Decimal(i + 1),
            });
            expect(cost).toEqual(Decimal.max(25 * .95, 25 * i * .95).ceil());
        }
    })
});