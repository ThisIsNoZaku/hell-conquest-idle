import {Character} from "./character";
import Decimal from "decimal.js";

jest.mock("./engine");

describe("character", function () {
    it("throws error if no id", function () {
        expect(() => new Character()).toThrowErrorMatchingSnapshot();
    });
    it("throws error if no tactics", function () {
        expect(() => new Character({id: 1, attributes: {}, traits: {}})).toThrowErrorMatchingSnapshot();
    });
    it("missing 'statuses' becomes an empty object", function () {
        expect(new Character({id: 1, attributes: {}, traits: {}, tactics: "defensive", powerLevel: Decimal(1)}))
            .toMatchObject({
                statuses: {}
            });
    });
    it("missing 'highestLevelReached' becomes 1", function () {
        expect(new Character({id: 1, attributes: {}, traits: {}, tactics: "defensive", powerLevel: Decimal(1)}))
            .toMatchObject({
                highestLevelReached: Decimal(1)
            });
    });
    it("missing 'isPc' becomes false", function () {
        expect(new Character({id: 1, attributes: {}, traits: {}, tactics: "defensive", powerLevel: Decimal(1)}))
            .toMatchObject({
                isPc: false
            });
    })
});

describe("reincarnate", function () {
    let character;
    beforeEach(() => {
        character = new Character({
            id: 0,
            powerLevel: 1,
            attributes: {},
            tactics: "deceptive"
        });
    });
    it("changes appearance", function () {
        character.reincarnate("bloodthirstyKnight", {})
        expect(character.appearance).toEqual("bloodthirstyKnight");
    });
    it("reset absorbed power", function () {
        character.reincarnate("bloodthirstyKnight", {})
        expect(character.absorbedPower).toEqual(Decimal(0));
    });
    it("reincarnate combines innate and bonus traits", function () {
        character.reincarnate("bloodthirstyKnight", {
            foo: 1
        })
        expect(character.traits).toEqual({
            foo: 1,
            bloodrage: 1,
        });
    });
    it("reincarnate uses the highest of new traits and demon trait", function () {
        character.reincarnate("bloodthirstyKnight", {
            bloodrage: 2
        });
        expect(character.traits).toEqual({
            bloodrage: 2,
        });
    });
    it("refreshes the character", function () {
        character.statuses = {
            foo: [{}],
            bar: [{}]
        }
        character.reincarnate("bloodthirstyKnight", {});
        expect(character.hp).toEqual(character.maximumHp);
        expect(character.statuses).toEqual({});
    });
})