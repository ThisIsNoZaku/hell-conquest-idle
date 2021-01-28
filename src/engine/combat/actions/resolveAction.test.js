import resolveAction from "./resolveAction";
import {Character} from "../../../character";
import {Decimal} from "decimal.js";

describe("resolve action", function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new Character({
            id: 0,
            tactics: {
                offensive: "overwhelming"
            }
        });
        enemy = new Character({
            id: 1,
            tactics: "defensive"
        });
    })
    it("performs an attack if acting character has Overwhelming tactics", function () {
        const roundEvents = [];
        resolveAction(player, {0: player, 1: enemy}, roundEvents, 100);
        expect(roundEvents).toEqual([
            {
                event: "attack",
                hitType: 0,
                children: [
                    expect.any(String)
                ],
                source: {
                    character: 0
                },
                target: 1,
                hit: true,
            },
            {
                event: "damage",
                type: "physical",
                value: Decimal(10),
                parent: expect.any(String)
            }
        ])
    });
});