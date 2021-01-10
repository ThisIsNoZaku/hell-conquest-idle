import resolveAttack from "./resolveAttack";
import Decimal from "decimal.js";
import CharacterCombatState from "../CharacterCombatState";

jest.mock("../index");

describe("attack resolution", function () {
    it("returns the id of the attacking character", function () {
        const roundContext = {
            attacker: new CharacterCombatState({
                id: 0,
                attributes: {
                    baseBrutality: 1,
                    baseCunning: 1,
                    baseDeceit: 1,
                    baseMadness: 1
                },
                combat: {
                    damage: {
                        min: Math.floor(5 * .8),
                        med: 5,
                        max: Math.floor(5 * 1.2)
                    },
                },
                precisionPoints: 0,
                evasionPoints: 0
            }),
            target: new CharacterCombatState({
                id: 1,
                attributes: {
                    baseBrutality: 1,
                    baseCunning: 1,
                    baseDeceit: 1,
                    baseMadness: 1
                },
                combat: {
                    damage: {
                        min: Math.floor(5 * .8),
                        med: 5,
                        max: Math.floor(5 * 1.2)
                    },
                },
                precisionPoints: 0,
                evasionPoints: 0
            })
        }
        const attackResult = resolveAttack(100, roundContext.attacker, roundContext.target);
        expect(attackResult).toMatchObject({
            actor: 0,
            event: "hit",
            hitType: "solid",
            targets: [1],
            effects: [
                {
                    type: "damage",
                    source: 0,
                    target: 1,
                    value: Decimal(5)
                }
            ]
        });
    })
})