import {knuthShuffle} from "knuth-shuffle";
import {Decimal} from "decimal.js";
import * as _ from "lodash";
import {inverseTriangleNumber} from "../index";

export default function calculateNPCBonuses(points, adjectives) {
    const attributeWeights = {
        brutality: _.sum(adjectives.map(a => a.attributeMultipliers.brutality)),
        cunning: _.sum(adjectives.map(a => a.attributeMultipliers.cunning)),
        deceit: _.sum(adjectives.map(a => a.attributeMultipliers.deceit)),
        madness: _.sum(adjectives.map(a => a.attributeMultipliers.madness))
    };

    const pointsAssigned = {
        brutality: 0,
        cunning: 0,
        deceit: 0,
        madness: 0
    }

    const attributeOrder = knuthShuffle(Object.keys(attributeWeights));

    while (points > 0) {
        const highestWeight = attributeOrder.reduce((highestWeight, next) => {
            const adjustedWeightOfHighest = attributeWeights[highestWeight]/(1 + pointsAssigned[highestWeight]);
            const adjustedWeightOfNext = attributeWeights[next]/(1 + pointsAssigned[next]);
            return adjustedWeightOfHighest >= adjustedWeightOfNext ? highestWeight : next;
        }, "brutality");
        pointsAssigned[highestWeight]++;
        points--;
    }
    const out = {
        attributes: {
            brutality: Decimal( inverseTriangleNumber(pointsAssigned.brutality) + 1).floor(),
            cunning: Decimal( inverseTriangleNumber(pointsAssigned.cunning)  + 1).floor(),
            deceit: Decimal( inverseTriangleNumber(pointsAssigned.deceit)  + 1).floor(),
            madness:Decimal( inverseTriangleNumber(pointsAssigned.madness)  + 1).floor(),
        }
    }
    return out;
}
