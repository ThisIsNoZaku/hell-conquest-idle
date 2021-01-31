import {Character} from "../../../character";
import determineCharacterCombatReaction from "./determineCharacterCombatReaction";
import {Decimal} from "decimal.js";

jest.mock("../../index");

describe("with 'none' tactics", function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new Character({
            id: 0
        });
        enemy = new Character({
            id: 1,
            tactics: {
                defensive: "none"
            }
        })
    });
    it("performs no reaction by default", function () {
        expect(determineCharacterCombatReaction(player, "basicAttack", enemy, Decimal(100)))
            .toEqual({
                primary: "none",
                enhancements: []
            });
    });
    it("performs 'dodge' at maximum energy", function () {
        enemy.combat.stamina = enemy.combat.maximumStamina;
        expect(determineCharacterCombatReaction(player, "basicAttack", enemy, enemy.combat.stamina))
            .toEqual({
                primary: "dodge",
                enhancements: []
            });
    });
})