import generateRoundActionLogItems from "./generateRoundActionLogItems";
import Decimal from "decimal.js";
import {getGlobalState} from "../index";

describe("generate round action log", function () {
    beforeEach(() => {
        getGlobalState().characters[1] = {
            id: 1,
            name: "Enemy"
        }
    })
    it("combines hit and damage events together", function () {
        const messages = generateRoundActionLogItems({
            events: [{
                event: "hit",
                hitType: 0,
                source: 0,
                children: ["1"],
                precisionUsed: 0,
                evasionUsed: 0,
                target: 1,
                damage: Decimal(1),
                uuid: "0"
            },
                {
                    uuid: "1",
                    event: "damage",
                    parent: "0",
                    value: Decimal(10),
                    source: 0,
                    target: 1,
                }]
        })
        expect(messages[0]).toEqual("You scored a Solid hit! Enemy takes 10 damage.");
    });
    it("prints kill message", function () {
        const messages = generateRoundActionLogItems({
            events: [{
                event: "kill",
                source: 0,
                target: 1,
                uuid: "0"
            },]
        })
        expect(messages[0]).toEqual("<strong>Enemy died!</strong>");
    });
    it("prints status events", function () {
        const messages = generateRoundActionLogItems({
            events: [{
                event: "add-status",
                status: "berserk",
                target: 1,
                source: 0,
                stacks: 1,
                duration: 1,
                uuid: "0"
            }]
        })
        expect(messages[0]).toEqual("Enemy gained 1 stack of Berserk for 1 action.");
    });
    it("prints fatigue damage events for player", function () {
        const messages = generateRoundActionLogItems({
            events: [{
                event: "fatigue-damage",
                status: "berserk",
                target: 0,
                source: 0,
                value: 1,
                uuid: "0"
            }]
        })
        expect(messages[0]).toEqual("You lose 1 health from exhaustion.");
    });
    it("prints fatigue damage events for enemy", function () {
        const messages = generateRoundActionLogItems({
            events: [{
                event: "fatigue-damage",
                status: "berserk",
                target: 1,
                source: 1,
                value: 1,
                uuid: "0"
            }]
        })
        expect(messages[0]).toEqual("Enemy loses 1 health from exhaustion.");
    });
});