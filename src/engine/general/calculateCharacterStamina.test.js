import Decimal from "decimal.js";
import calculateCharacterStamina from "./calculateCharacterStamina";

describe("character stamina calculation", function () {
    it("equals the minimum plus 25 per power level", function () {
        let i = 1;
        for(i; i <= 100; i++) {
            const calculatedStamina = calculateCharacterStamina(Decimal(i), {});
            expect(calculatedStamina).toEqual(Decimal( 350 + (i * 50)));
        }
    });
});