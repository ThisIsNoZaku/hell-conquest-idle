import Grid from "@material-ui/core/Grid";
import {getCharacter} from "./engine";
import React from "react";
import {Decimal} from "decimal.js";
import {debugMessage} from "./debugging";
import {Statuses} from "./data/Statuses";

export default function generateLogItem(item) {
    const result = {
        original: item,
        tick: item.tick
    };
    if(item.message) {
        return item;
    }
    switch (item.result) {
        case "hit":
            result.message = `${getCharacter(item.actor).name} hit! ${item.effects.map(effect => describeEffect(item.target, effect)).join(" ")}`;
            break;
        case "miss":
            result.message = `${getCharacter(item.actor).name} ${item.actor === 0 ? 'miss' : 'missed'}! ${item.effects.map(effect => describeEffect(item.target, effect)).join(" ")}`;
            break;
        case "kill":
            result.message = `<strong>${getCharacter(item.target).name} ${item.target === 0 ? 'Were' : 'Was'} Killed!</strong>`;
            break;
        case "gainedPower":
            result.message = `You absorbed ${item.value.toFixed()} power.`;
            break;
        case "healed":
            result.message = `${getCharacter(item.target).name} gained ${item.value} health.`
            break;
        case "escaped":
            result.message = "You escaped";
            break;
        case "action_skipped":
            result.message = `${getCharacter(item.actor).name} lost ${item.actor === 0 ? 'your' : 'their'} action.`;
            break;
        case "intimidated":
            result.message = `${getCharacter(item.target).name} was Bound to you, granting you {item.value.toFixed()} power while you explore.`
            break;
        case "enemy-fled":
            result.message = `${getCharacter(item.target).name} Fled!`;
            break;
        case "combat-end":
            result.message = `Battle ended`;
            break;
        case "add_statuses":
            result.message = `${getCharacter(item.target).name} ${item.target === 0 ? 'gain' : 'gained'} ${Decimal(item.level).toFixed()} levels of ${Statuses[item.status].name}`
        case "status-removed":
            result.message = `${Statuses[item.status].name} was removed from ${getCharacter(item.actor).name}.`
        default:
            debugMessage(`${JSON.stringify(item)}`);
    }
    return result;
}

function describeEffect(target, effect) {
    switch (effect.event) {
        case "damage":
            return `${getCharacter(effect.target).name} ${effect.target == 0 ? 'take' : 'takes'} ${effect.value} Damage.`;
        case "add_statuses":
            return `${getCharacter(effect.target).name} gained ${Decimal(effect.level).toFixed()} of ${Statuses[effect.status].name}.`;
    }
}