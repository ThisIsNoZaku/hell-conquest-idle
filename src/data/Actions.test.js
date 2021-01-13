import {getGlobalState} from "../engine";
import {Actions} from "./Actions";

jest.mock("../")
describe("Exploring action", function() {
    it("completion clears the current encounter", function(){
        getGlobalState().currentEncounter = {};
        expect(getGlobalState().currentEncounter).toBeDefined();
        const nextAction = Actions["exploring"].complete();
        expect(getGlobalState().currentEncounter).toBeNull();
        expect(nextAction).toEqual("hunting");
    });
})