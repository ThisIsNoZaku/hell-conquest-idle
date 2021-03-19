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
jest.mock("../combat/events/onRoundBegin");

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
        resolveAction.mockClear();
        determineCharacterCombatAction.mockClear();
        triggerEvent.mockClear();
    });
    it("determines action from lowest to highest initiative", function () {
        enemy.initiative = 1;
        determineCharacterCombatAction.mockReturnValue({
            primary: "none",
            enhancements: []
        });
        resolveCombatRound(100, {0: player, 1: enemy});
        expect(determineCharacterCombatAction).toHaveBeenNthCalledWith(1, player, enemy, null, expect.any(Array));
        expect(determineCharacterCombatAction).toHaveBeenNthCalledWith(2, enemy, player, expect.any(Object), expect.any(Array));
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
        expect(resolveAction)
            .toHaveBeenCalledWith(enemy, {primary: "basicAttack", enhancements: []}, player, {
                primary: "block",
                enhancements: []
            }, expect.any(Array), 100);
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
            .toHaveBeenNthCalledWith(1, enemy, expect.any(Object),
                player, expect.any(Object),
                expect.any(Array), 100);

        expect(resolveAction)
            .toHaveBeenNthCalledWith(2, player, expect.any(Object), enemy, expect.any(Object), expect.any(Array), 100);
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
            combatants: {
                0: player,
                1: enemy
            },
            roundEvents: expect.any(Array)
        });
    });
    it("if first character and second character block, both do nothing", function () {
        determineCharacterCombatAction.mockReturnValueOnce({
            primary: "block",
            enhancements: []
        }).mockReturnValueOnce({
            primary: "block",
            enhancements: []
        });
        resolveCombatRound(100, {0: player, 1: enemy});
        expect(resolveAction).not.toHaveBeenCalled()
    });
    it("if second character blocks and the first dodges, the first still dodges", function () {
        determineCharacterCombatAction.mockReturnValueOnce({
            primary: "dodge",
            enhancements: []
        }).mockReturnValueOnce({
            primary: "block",
            enhancements: []
        });
        resolveCombatRound(100, {0: player, 1: enemy});
        expect(resolveAction).toHaveBeenNthCalledWith(1, player, {primary: "none", enhancements: []}, enemy, {
            primary: "dodge", enhancements: []
        }, expect.any(Array), 100);
        expect(resolveAction).toHaveBeenCalledTimes(1);
    });
    it("if first character blocks and the second dodges, the second still dodges", function () {
        determineCharacterCombatAction.mockReturnValueOnce({
            primary: "block",
            enhancements: []
        }).mockReturnValueOnce({
            primary: "dodge",
            enhancements: []
        });
        resolveCombatRound(100, {0: player, 1: enemy});
        expect(resolveAction).toHaveBeenNthCalledWith(1, enemy, {primary: "none", enhancements: []}, player, {
            primary: "dodge", enhancements: []
        }, expect.any(Array), 100);
        expect(resolveAction).toHaveBeenCalledTimes(1);
    });
});