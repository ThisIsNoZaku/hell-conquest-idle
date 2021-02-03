import determineCharacterCombatAction from "./determineCharacterCombatAction";
import {Character} from "../../../character";
import {Decimal} from "decimal.js";

jest.mock("../../index");

describe('action with overwhelming tactics', function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new Character({
            id: 0,
            powerLevel: 1,
            tactics: {
                offensive: "overwhelm",
                defensive: "none"
            }
        }, 0);
        enemy = new Character({
            id: 1,
            powerLevel: 1,
            tactics: {
                offensive: "overwhelm",
                defensive: "none"
            }
        }, 1);
    });
    it("is a powerAttack with enough stamina", function () {
        player.combat.stamina = Decimal(1000);
        expect(determineCharacterCombatAction(player, player.combat.stamina, enemy))
            .toEqual({
                primary:"powerAttack",
                enhancements: []
            });
    });
    it("is none if not enough stamina", function () {
        player.combat.stamina = Decimal(0);
        expect(determineCharacterCombatAction(player, player.combat.stamina, enemy))
            .toEqual({
                primary: "none",
                enhancements: []
            });
    });
    it("performs a power attack with max stamina", function () {
        player.combat.stamina = player.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, player.combat.stamina, enemy))
            .toEqual({
                primary: "powerAttack",
                enhancements: []
            })
    })
});

describe("action with 'attrit' tactics", function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new Character({
            id: 0,
            powerLevel: 1,
            tactics: {
                offensive: "attrit",
                defensive: "none"
            }
        }, 0);
        enemy = new Character({
            id: 1,
            powerLevel: 1,
            tactics: {
                offensive: "overwhelm",
                defensive: "none"
            }
        }, 1);
    });
    it("is a basic attack with enough stamina", function () {
        player.combat.stamina = Decimal(1000);
        expect(determineCharacterCombatAction(player, player.combat.stamina, enemy))
            .toEqual({
                primary:"basicAttack",
                enhancements: []
            });
    });
    it("is no attack without enough stamina", function () {
        player.combat.stamina = Decimal(0);
        expect(determineCharacterCombatAction(player, player.combat.stamina, enemy))
            .toEqual({
                primary: "none",
                enhancements: []
            });
    });
    it("performs a power attack with max stamina", function () {
        player.combat.stamina = player.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, player.combat.stamina, enemy))
            .toEqual({
                primary: "powerAttack",
                enhancements: []
            })
    })
});

describe("action with 'counter' tactics", function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new Character({
            id: 0,
            powerLevel: 1,
            tactics: {
                offensive: "counter",
                defensive: "none"
            }
        }, 0);
        enemy = new Character({
            id: 1,
            powerLevel: 1,
            tactics: {
                offensive: "overwhelm",
                defensive: "none"
            }
        }, 1);
    });
    it("is no attack when enemy can dodge", function () {
        expect(determineCharacterCombatAction(player, Decimal(100), enemy))
            .toEqual({
                primary: "none",
                enhancements: []
            });
    });
    it("is a power attack when enemy cannot dodge", function () {
        player.combat.stamina = Decimal(1000);
        expect(determineCharacterCombatAction(player, player.combat.stamina, enemy))
            .toEqual({
                primary: "powerAttack",
                enhancements: []
            });
    });
    it("performs a power attack with max stamina", function () {
        player.combat.stamina = player.combat.maximumStamina;
        expect(determineCharacterCombatAction(player, player.combat.stamina, enemy))
            .toEqual({
                primary: "powerAttack",
                enhancements: []
            })
    })
});