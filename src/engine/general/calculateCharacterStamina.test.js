import {getConfigurationValue} from "../../config";
import Decimal from "decimal.js";
import calculateCharacterStamina from "./calculateCharacterStamina";

describe("character stamina calculation", function () {
    it("equals the minimum plus 10% of power level", function () {
        let i = 0;
        for(i; i < 100; i++) {
            const calculatedPower = calculateCharacterStamina(Decimal(i), {});
            expect(calculatedPower).toEqual(Decimal(3 + Math.floor(i / 10)));
        }
    });
});