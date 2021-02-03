import resolveAction from "./resolveAction";
import {Character} from "../../../character";
import {Decimal} from "decimal.js";
import {HitTypes} from "../../../data/HitTypes";

describe("resolve action", function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new Character({
            id: 0,
            tactics: {
                offensive: "overwhelm"
            }
        });
        enemy = new Character({
            id: 1,
            tactics: {
                defensive: "none"
            }
        });
    })
    it("performs a power attack if acting character has Overwhelming tactics", function () {
        const roundEvents = [];
        player.combat.stamina = Decimal(1000);
        resolveAction(player, {0: player, 1: enemy}, roundEvents, 100);
        expect(roundEvents).toEqual([
            {
                event: "attack",
                hitType: 1,
                children: [
                    expect.any(String)
                ],
                source: {
                    character: 0
                },
                action: {
                    primary:"powerAttack",
                    enhancements:[]
                },
                actionEnergyCost: Decimal(25 * .9 * 2.5).floor(),
                reaction: {
                    primary:"none",
                    enhancements:[]
                },
                reactionEnergyCost: Decimal(0).floor(),
                target: 1,
                uuid: expect.any(String),
                hit: true,
            },
            {
                event: "damage",
                type: "physical",
                value: Decimal(15 * HitTypes[1].damageMultiplier),
                target: 1,
                source: {
                    character: 0,
                    "undefined": undefined
                },
                uuid: expect.any(String),
                parent: expect.any(String)
            }
        ])
    });
});