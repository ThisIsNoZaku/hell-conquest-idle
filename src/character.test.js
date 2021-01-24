import {Character} from "./character";
import Decimal from "decimal.js";
import {getGlobalState} from "./engine";

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
            tactics: "deceptive"
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

describe("character combat stats", function () {
    it("incoming attack downgrade cost is reduced by evasion", function () {
        let i = 1;
        for(i; i <= 20; i++) {
            const calculatedCost = new Character({
                id: 0,
                powerLevel: 1,
                attributes: {
                    baseCunning: Decimal(i)
                },
                tactics: "aggressive",
                combat: {

                }
            }, 0).combat.incomingAttackDowngradeCost;
            expect(calculatedCost).toEqual(Decimal(1).minus(Decimal(i).times(0.1)).times(100));
        }
    });
    it("attack upgrade cost is reduced by precision", function () {
        let i = 1;
        for(i; i <= 20; i++) {
            const calculatedCost = new Character({
                id: 0,
                powerLevel: 1,
                attributes: {
                    baseDeceit: Decimal(i)
                },
                tactics: "deceptive"
            }, 0).combat.attackUpgradeCost;
            const attributeMod = Decimal(1).minus(Decimal(i).times(1.25).times(Decimal(0.1)));
            expect(calculatedCost).toEqual(Decimal(100)
                .times(attributeMod).times(1).ceil());
        }
    });
});