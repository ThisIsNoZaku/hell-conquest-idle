import Decimal from "decimal.js";
import resolveCombatRound from "../combat/resolveCombatRound";
import * as _ from "lodash";
import {Character} from "../../character";
import triggerEvent from "./triggerEvent";
import calculateDamageBy from "../combat/calculateDamageBy";
import calculateAttackDowngradeCost from "../combat/calculateAttackDowngradeCost";
import calculateAttackUpgradeCost from "../combat/calculateAttackUpgradeCost";
import resolveAttack from "../combat/resolveAttack";
import {generateHitEvents} from "../events/generate";
import {getCharacter} from "../index";
import {getConfigurationValue} from "../../config";

jest.mock("../index");
// jest.mock("../combat/resolveAttack");

describe("acidic effect", function () {
    let player;
    let enemy;
    beforeEach(() => {
        player = new Character({
            id: 0,
            tactics: "defensive"
        });
        enemy = new Character({
            id: 1,
            tactics: "defensive"
        });
    })
    it("causes attacks to deal acid damage", function () {
        const attackResult = resolveAttack(100, {0: player, 1: enemy});
        const playerAttack = generateHitEvents(0, player, enemy,  5, "acid", 0, 0, 0, 0);
        const enemyAttack = generateHitEvents(0, enemy, player, 0, "physical", 0, 0, 0, 0);
        expect(attackResult).toEqual({
            hitLevel: 0,
            events: [
                playerAttack.attack,
                playerAttack.damage,
                enemyAttack.attack,
                enemyAttack.damage
            ]
        })
    });
});

