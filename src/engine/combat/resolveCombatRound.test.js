import triggerEvent from "../general/triggerEvent";
import {resolveCombatRound} from "./index";
import {Character} from "../../character";
import resolveAction from "./actions/resolveAction";

jest.mock("../index");
jest.mock("../general/triggerEvent");
jest.mock("../combat/actions/resolveAction");

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
    })
    it("calls onRoundBegin for each combatant", function() {
        resolveCombatRound(100, {0: player, 1: enemy});
        expect(triggerEvent).toHaveBeenCalledWith({
            type: "on_round_begin",
            source: {
                character: player
            },
            combatants: {
                0: player,
                1: enemy
            },
            roundEvents: expect.any(Array)
        });
        expect(triggerEvent).toHaveBeenCalledWith({
            type: "on_round_begin",
            source: {
                character: enemy
            },
            combatants: {
                0: player,
                1: enemy
            },
            roundEvents: expect.any(Array)
        })
    });
    it("calls resolveAction for each combatant", function() {
        resolveCombatRound(100, {0: player, 1: enemy});
        expect(resolveAction).toHaveBeenCalledWith(player, {0: player, 1: enemy}, expect.any(Array), 100);
        expect(resolveAction).toHaveBeenCalledWith(enemy, {0: player, 1: enemy}, expect.any(Array), 100);
    });
    it("calls onRoundEnd for each combatant", function() {
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
        expect(triggerEvent).toHaveBeenCalledWith({
            type: "on_round_end",
            source: {
                character: enemy
            },
            combatants: {
                0: player,
                1: enemy
            },
            roundEvents: expect.any(Array)
        })
    });
});