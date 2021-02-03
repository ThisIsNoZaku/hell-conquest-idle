import Decimal from "decimal.js";
import calculateCharacterStamina from "./calculateCharacterStamina";
import {getConfigurationValue} from "../../config";

describe("character stamina calculation", function () {
    it("equals the minimum plus 25 per power level", function () {
        let i = 1;
        for(i; i <= 10; i++) {
            const calculatedStamina = calculateCharacterStamina(Decimal(i), 0, Decimal(0), {});
            expect(calculatedStamina).toEqual(Decimal( getConfigurationValue("minimum_stamina") + (i * getConfigurationValue("bonus_stamina_per_level"))));
        }
    });
});