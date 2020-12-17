import calculatedValue from "./calculatedValue";

describe('a calculated value', function () {
    it("has a base value", function () {
        const calculated = calculatedValue(1);
        expect(calculated === 1).toBeTruthy();
    });
});