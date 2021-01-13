import {getCharacter} from "../index";
import {Statuses} from "../../data/Statuses";
import {Decimal} from "decimal.js";
import {HitTypes} from "../../data/HitTypes";

export default function generateRoundActionLogItems(round) {
    const actionMessages = [];
    const processed = {};
    round.events.forEach(event => {
        let messageElements = [];
        if(!processed[event.uuid]) {
            processed[event.uuid] = true;
            messageElements.push(describeEvent(event));
            (event.children || []).forEach(child => {
                messageElements.push(describeEvent(round.events.find(ev => ev.uuid === child)));
                processed[child] = true;
            })
            actionMessages.push(messageElements.join(" "));
        }
    });
    return actionMessages;
}

function describeEvent(event) {
    const sourceName = getCharacter(event.source).name;
    const targetName = getCharacter(event.target).name;
    switch (event.event) {
        case "kill":
            return `<strong>${targetName} died!</strong>`
        case "hit":
            const base = `${sourceName} scored a ${HitTypes[event.hitType].type} hit! `;
            const upgrade =  Decimal(event.precisionUsed).gt(0) ? `${event.precisionUsed} points were spent to upgrade the attack ${event.timesUpgraded} steps. ` : "";
            const downgrade = Decimal(event.evasionUsed).gt(0) ? `${event.evasionUsed} points were spent to downgrade the attack ${event.timesDowngraded} steps. ` : "";
            return base + upgrade + downgrade;
        case "damage":
            return `${targetName} ${event.target === 0 ? 'take' : 'takes'} ${event.value.toFixed()} damage.`;
        case "fatigue-damage":
            return `${targetName} loses ${event.value.toFixed()} health from exhaustion.`;
        case "add-status":
            return `${targetName} gained ${Decimal(event.stacks).toFixed()} stacks of ${Statuses[event.status].name} for ${event.duration} actions.`;
    }
}