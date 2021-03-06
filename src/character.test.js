import {Character} from "./character";
import Decimal from "decimal.js";
import {getGlobalState} from "./engine";
import {HitTypes} from "./data/HitTypes";
import {getConfigurationValue} from "./config";

jest.mock("./engine");

describe("character", function () {
    it("throws error if no id", function () {
        expect(() => new Character()).toThrowErrorMatchingSnapshot();
    });
    it("missing tactics becomes 'attrit' and 'block'", function () {
        expect( new Character({id: 1, attributes: {}, traits: {}}).tactics).toEqual({
            offensive: "attrit",
            defensive: "block"
        });
    });
    it("missing 'statuses' becomes an empty object", function () {
        expect(new Character({id: 1, attributes: {}, powerLevel: Decimal(1)}))
            .toMatchObject({
                statuses: {}
            });
    });
    it("missing 'highestLevelReached' becomes 1", function () {
        expect(new Character({id: 1, attributes: {}, traits: {}, powerLevel: Decimal(1)}))
            .toMatchObject({
                highestLevelReached: Decimal(1)
            });
    });
    it("missing 'isPc' becomes false", function () {
        expect(new Character({id: 1, attributes: {}, traits: {}, powerLevel: Decimal(1)}))
            .toMatchObject({
                isPc: false
            });
    });
    it(`has health equal to level * ${getConfigurationValue("health_per_level")}`, function () {
        for(let i = 1; i <= 100; i++) {
            const character = new Character({id: 1, attributes: {}, traits: {}, powerLevel: Decimal(i)});
            const expectedHealth = Decimal(getConfigurationValue("health_per_level") * i * (1 + getConfigurationValue("attribute_health_modifier_scale"))).floor();
            expect(character.hp).toEqual(expectedHealth);
        }
    });
    it("has base damage equal to level * 5", function () {
        for(let i = 1; i <= 100; i++) {
            const character = new Character({id: 1, attributes: {}, traits: {}, powerLevel: Decimal(i)});
            expect(character.damage[-1]).toEqual(Decimal(5 * i * HitTypes[-1].damageMultiplier).ceil());
            expect(character.damage[0]).toEqual(Decimal(5 * i * HitTypes[0].damageMultiplier));
            expect(character.damage[1]).toEqual(Decimal(5 * i * HitTypes[1].damageMultiplier));
        }
    });
});

describe("reincarnate", function () {
    let character;
    let globalState
    beforeEach(() => {
        globalState = {
            unlockedTraits: {}
        }
        getGlobalState.mockClear();
        character = new Character({
            id: 0,
            powerLevel: 1,
            attributes: {},
        });
        getGlobalState.mockReturnValue(globalState);
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
        globalState.unlockedTraits = {
            foo: 1
        };
        character.reincarnate("bloodthirstyKnight", {
            foo: true
        })
        expect(character.traits).toEqual({
            foo: 1,
            bloodrage: 1,
        });
    });
    it("reincarnate uses the highest of new traits and demon trait", function () {
        globalState.unlockedTraits.bloodrage = 2;
        character.reincarnate("bloodthirstyKnight", {
            bloodrage: true
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