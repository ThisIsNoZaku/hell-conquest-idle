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
                event: "attack",
                hit: true,
                hitType: 0,
                source: {
                    character: 0
                },
                children: ["1"],
                action: {
                    primary: "basicAttack"
                },
                actionEnergyCost: Decimal(25),
                reaction: {
                    primary: "none"
                },
                reactionEnergyCost: Decimal(0),
                target: 1,
                damage: Decimal(1),
                uuid: "0"
            },
                {
                    uuid: "1",
                    event: "damage",
                    parent: "0",
                    value: Decimal(10),
                    source: {
                        character: 0
                    },
                    target: 1,
                }]
        })
        expect(messages[0]).toEqual("You used 25 Energy for a Basic Attack and scored a Solid hit! Enemy takes 10 damage.");
    });
    it("prints kill message", function () {
        const messages = generateRoundActionLogItems({
            events: [{
                event: "kill",
                source: {character: 0},
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
                source: {
                    character: 0
                },
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
                source: {
                    character: 0
                },
                value: 1,
                uuid: "0"
            }]
        })
        expect(messages[0]).toEqual("You lose 1 health from Energy Burn.");
    });
    it("prints fatigue damage events for enemy", function () {
        const messages = generateRoundActionLogItems({
            events: [{
                event: "fatigue-damage",
                status: "berserk",
                target: 1,
                source: {
                    character: 1
                },
                value: 1,
                uuid: "0"
            }]
        })
        expect(messages[0]).toEqual("Enemy loses 1 health from Energy Burn.");
    });
    it("prints damage if not physical", function () {
        const messages = generateRoundActionLogItems({
            events: [{
                event: "damage",
                target: 1,
                source: {
                    character: 1
                },
                value: 1,
                uuid: "0",
                type: "psychic"
            }]
        })
        expect(messages[0]).toEqual("Enemy takes 1 psychic damage.");
    })
});