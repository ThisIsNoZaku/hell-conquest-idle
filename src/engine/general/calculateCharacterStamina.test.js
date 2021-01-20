import Decimal from "decimal.js";
import calculateCharacterStamina from "./calculateCharacterStamina";

describe("character stamina calculation", function () {
    it("equals the minimum plus 10% of power level", function () {
        let i = 1;
        for(i; i <= 100; i++) {
            const calculatedStamina = calculateCharacterStamina(Decimal(i), {});
            expect(calculatedStamina).toEqual(Decimal( 3 + (i / 10)).times(100));
        }
    });
});