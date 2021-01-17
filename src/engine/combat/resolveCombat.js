import * as _ from "lodash";
import resolveCombatRound from "./resolveCombatRound";
import {Character} from "../../character";

export default function resolveCombat(parties) {
    let combatants = _.flatMap(parties)
        .map(c => new Character(c, c.id === 0 ? 0 : 1))
        .reduce((previousValue, currentValue) =>{
            previousValue[currentValue.id] = currentValue;
            return previousValue;
        }, {});
    let tick = 0;
    // Start of combat effects.
    let firstPartyDead = false;
    let secondPartyDead = false;
    const roundResults = {
        0: {
            tick: 0,
            events: [],
            initiativeOrder: []
        }
    };
    while(!firstPartyDead && !secondPartyDead) {
        tick += 100;
        const currentRoundsEffects = resolveCombatRound(tick, combatants);
        roundResults[tick] = currentRoundsEffects;

        firstPartyDead = Object.values(combatants).filter(c => c.party === 0)
            .every(c => {
                return !c.isAlive
            });
        secondPartyDead  = Object.values(combatants).filter(c => c.party === 1)
            .every(c => !c.isAlive);
        roundResults[tick].end = firstPartyDead || secondPartyDead;
    }
    return roundResults;
}