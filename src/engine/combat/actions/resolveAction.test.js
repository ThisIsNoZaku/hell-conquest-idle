import resolveAction from "./resolveAction";
import {Character} from "../../../character";

jest.mock("../resolveAttack");

describe("action resolution", function () {
    let enemy;
    let player;
    beforeEach(() => {
        player = new Character({
            id: 0
        });
        enemy = new Character({
            id: 1
        });
    })
    it("gives an initiative penalty from a power attack", function () {
        resolveAction(player, {
            primary: "powerAttack",
            enhancements: []
        }, enemy, {
            primary: "none",
            enhancements: []
        }, [], 100);
        expect(player.initiative).toEqual(-10);
    });
    it("blocking or dodging an attack gives the attacker a penalty", function () {
        resolveAction(player, {
            primary: "basicAttack",
            enhancements: []
        }, enemy, {
            primary: "block",
            enhancements: []
        }, [], 100);
        expect(player.initiative).toEqual(-10);
    });
    it("a basic attack gives a small penalty", function () {
        resolveAction(player, {
            primary: "basicAttack",
            enhancements: []
        }, enemy, {
            primary: "none",
            enhancements: []
        }, [], 100);
        expect(player.initiative).toEqual(-5);
    });
    it("blocking gives the defender a small penalty", function () {
        resolveAction(player, {
            primary: "basicAttack",
            enhancements: []
        }, enemy, {
            primary: "block",
            enhancements: []
        }, [], 100);
        expect(enemy.initiative).toEqual(-5);
    });
    it("dodging gives the defender a large bonus", function () {
        resolveAction(player, {
            primary: "basicAttack",
            enhancements: []
        }, enemy, {
            primary: "dodge",
            enhancements: []
        }, [], 100);
        expect(enemy.initiative).toEqual(10);
    });
    it("no reaction resets initiative to 0", function () {
        resolveAction(player, {
            primary: "powerAttack",
            enhancements: []
        }, enemy, {
            primary: "none",
            enhancements: []
        }, [], 100);
        expect(enemy.initiative).toEqual(0);
    });
    it("no action resets initiative to 0", function () {
        resolveAction(player, {
            primary: "none",
            enhancements: []
        }, enemy, {
            primary: "none",
            enhancements: []
        }, [], 100);
        expect(player.initiative).toEqual(0);
    });
})