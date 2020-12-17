import {resolveCombat} from "./engine";
import { alea as rng } from "seedrandom";

describe("The combat system", function () {
    it("returns an object describing the combat result", function () {
        const player = {
            id: "pc",
            isPc: true,
            level: 1,
            speed: 100,
            fatigue: 0,
            currentHp: 10,
            traits: []
        };
        const monster = {
            id: "mon-1",
            level: 1,
            fatigue: 0,
            speed: 100,
            currentHp: 5,
            traits: []
        };
        const parties = [[player], [monster]];
        const combatResult = resolveCombat(rng("0"), {
            parties
        });
        expect(combatResult).toEqual({
            winner: 0,
            parties: [[{
                id: "pc",
                fatigue: 12,
                isPc: true,
                level: 1,
                speed: 100,
                currentHp: 4,
                traits: []
            }], [{
                id: "mon-1",
                currentHp: 0,
                speed: 100,
                fatigue: 11,
                level: 1,
                traits: []
            }]],
            rounds: [
                {
                    effects: [],
                    result: "miss",
                    tick: 0
                },
                {
                    result: "hit",
                    tick: 0,
                    effects: [
                        {
                            event: "damage",
                            target: player,
                            value: 1
                        }
                    ]
                },
                {
                    effects: [
                        {
                            event: "damage",
                            target: monster,
                            value: 1
                        }
                    ],
                    result: "hit",
                    tick: 100,

                },
                {
                    effects: [{
                        event: "damage",
                        target: player,
                        value: 1
                    }],
                    result: "hit",
                    tick: 100
                },
                {
                    effects: [],
                    result: "miss",
                    tick: 200
                },
                {
                    effects: [],
                    result: "miss",
                    tick: 200
                },
                {
                    effects: [
                        {
                            event: "damage",
                            target: monster,
                            value: 1
                        }
                    ],
                    result: "hit",
                    tick: 300
                },
                {
                    effects: [
                        {
                            event: "damage",
                            target: player,
                            value: 1
                        }
                    ],
                    result: "hit",
                    tick: 300
                },
                {
                    effects: [],
                    result: "miss",
                    tick: 400
                },
                {
                    effects:[],
                    result: "miss",
                    tick: 400
                }
            ]
        });
    });
});