import resolveCombatRound from "./resolveCombatRound";
import Decimal from "decimal.js";
import {HitTypes} from "../../data/HitTypes";
import {Character} from "../../character";
import {getConfigurationValue} from "../../config";
import {Tactics} from "../../data/Tactics";

jest.mock("../index");

// describe('The combat round resolution', function () {
//     let player;
//     let enemy;
//     beforeEach(() => {
//         player = new Character({
//             isPc: true,
//             id: 0,
//             hp: Decimal(50),
//             tactics: "defensive",
//             powerLevel: 1,
//             attributes: {
//                 baseBrutality: 1,
//                 baseCunning: 1,
//                 baseDeceit: 1,
//                 baseMadness: 1
//             }
//         }, 0);
//         enemy = new Character({
//             id: 1,
//             hp: Decimal(50),
//             powerLevel: 1,
//             tactics: "defensive",
//             attributes: {
//                 baseBrutality: 1,
//                 baseCunning: 1,
//                 baseDeceit: 1,
//                 baseMadness: 1
//             }
//         }, 1);
//     });
// });