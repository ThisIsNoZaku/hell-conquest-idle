import triggerEvent from "./triggerEvent";

describe("triggerEvent", function () {
    it("throws an error if event has no type", function () {
        expect(()=> {
            triggerEvent({});
        }).toThrowErrorMatchingSnapshot();
    });
    it("throws an error if combatants is missing", function () {
        expect(()=> {
            triggerEvent({
                type: "aType"
            });
        }).toThrowErrorMatchingSnapshot();
    });
    it("throws an error if event has no roundEvents", function () {
        expect(()=> {
            triggerEvent({
                type: "aType",
                combatants: {}
            });
        }).toThrowErrorMatchingSnapshot();
    });
});