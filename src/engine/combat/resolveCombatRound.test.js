import triggerEvent from "../general/triggerEvent";
import {resolveCombatRound} from "./index";
import {Character} from "../../character";
import resolveAttack from "./resolveAttack";
import determineCharacterCombatAction from "./actions/determineCharacterCombatAction";
import onRoundBegin from "./events/onRoundBegin";
import resolveAction from "./actions/resolveAction";

jest.mock("../index");
jest.mock("../general/triggerEvent");
jest.mock("../combat/resolveAttack");
jest.mock("../combat/actions/resolveAction");
jest.mock("../combat/actions/determineCharacterCombatAction");
jest.mock("../combat/actions/onRoundBegin");

describe("the combat round resolution", function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new Character({
            id: 0
        });
        enemy = new Character({
            id: 1
        });
        resolveAttack.mockClear();
        determineCharacterCombatAction.mockClear();
    });
    it("determines action from highest to lowest initiative", function () {
        enemy.initiative = 1;
        determineCharacterCombatAction.mockReturnValue({
            primary: "none",
            enhancements: []
        });
        resolveCombatRound(100, {0: player, 1: enemy});
        expect(determineCharacterCombatAction).toHaveBeenNthCalledWith(1, enemy, player);
        expect(determineCharacterCombatAction).toHaveBeenNthCalledWith(2, player, enemy, expect.any(Object));
    });
    it("calls onRoundBegin once", function () {
        resolveCombatRound(100, {0: player, 1: enemy});
        expect(triggerEvent).toHaveBeenCalledWith({
            type: "on_round_begin",
            combatants: {
                0: player,
                1: enemy
            },
            roundEvents: expect.any(Array)
        });
    });
    it("calls resolveAttack once if one character attacks and another defends", function () {
        determineCharacterCombatAction.mockReturnValueOnce({
            primary: "basicAttack",
            enhancements: []
        }).mockReturnValueOnce({
            primary: "block",
            enhancements: []
        });
        resolveAttack.mockReturnValue({
            attack: {}
        });
        resolveCombatRound(100, {0: player, 1: enemy});
        expect(resolveAttack)
            .toHaveBeenCalledWith(player, {primary: "basicAttack", enhancements: []}, enemy, {
                primary: "block",
                enhancements: []
            }, 100);
    });
    it("calls resolveAttack twice if both characters attack", function () {
        determineCharacterCombatAction.mockReturnValue({
            primary: "basicAttack",
            enhancements: []
        });
        resolveAttack.mockReturnValue({
            attack: {},
            defense: {}
        });
        resolveCombatRound(100, {0: player, 1: enemy});
        expect(resolveAction)
            .toHaveBeenNthCalledWith(1, player, {primary: "basicAttack", enhancements: []}, enemy, {
                primary: "none",
                enhancements: []
            }, 100);

        expect(resolveAttack)
            .toHaveBeenNthCalledWith(2, enemy, {primary: "basicAttack", enhancements: []}, player, {
                primary: "none",
                enhancements: []
            }, 100);
    });
    it("does not call resolveAttack if both characters defend", function () {
        determineCharacterCombatAction.mockReturnValue({
            primary: "block",
            enhancements: []
        });
        resolveCombatRound(100, {0: player, 1: enemy});
        expect(resolveAttack).not.toHaveBeenCalled();
    });
    it("calls onRoundEnd once", function () {
        resolveCombatRound(100, {0: player, 1: enemy});
        expect(triggerEvent).toHaveBeenCalledWith({
            type: "on_round_end",
            source: {
                character: player
            },
            combatants: {
                0: player,
                1: enemy
            },
            roundEvents: expect.any(Array)
        });
    });
});