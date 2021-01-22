import {getCharacter} from "../index";
import {Statuses} from "../../data/Statuses";
import {Decimal} from "decimal.js";
import {HitTypes} from "../../data/HitTypes";

export default function generateRoundActionLogItems(round) {
    const actionMessages = [];
    const processed = {};
    round.events.forEach(event => {
        let messageElements = [];
        if (!processed[event.uuid]) {
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
    const sourceName = getCharacter(event.source.character).name;
    const targetName = getCharacter(event.target).name;
    switch (event.event) {
        case "stamina-change":
            return `${targetName} ${event.value.lt(0) ? 'lost' : 'gained'} ${event.value} energy`;
        case "kill":
            return `<strong>${targetName} died!</strong>`
        case "attack":
            const base = event.hit ? `${sourceName} scored a ${HitTypes[event.hitType].type} hit!` : `${sourceName} missed!`;
            const upgrade = Decimal(event.precisionUsed).gt(0) ? `${event.precisionUsed} Precision was used to upgrade the attack ${event.timesUpgraded} step${event.timesUpgraded !== 1 ? 's' : ''}. ` : null;
            const downgrade = Decimal(event.evasionUsed).gt(0) ? `${event.evasionUsed} Evasion was used to downgrade the attack ${event.timesDowngraded} step${event.timesDowngraded !== 1 ? 's' : ''}. ` : null;
            return [base, upgrade, downgrade].filter(e => e !== null).join(" ");
        case "damage":
            return `${targetName} ${event.target === 0 ? 'take' : 'takes'} ${event.value.toFixed()} damage.`;
        case "fatigue-damage":
            const damage = Decimal(event.value);
            return `${targetName} lose${targetName === "You" ? "" : "s"} ${damage.toFixed()} health from exhaustion.`;
        case "add-status":
            const numStacks = Decimal(event.stacks);
            const duration = Decimal(event.duration);
            return `${targetName} gained ${numStacks.toFixed()} stack${numStacks.eq(1) ? "" : "s"} of ${Statuses[event.status].name} for ${event.duration} action${duration.eq(1) ? "" : "s"}.`;
        case "remove-status": {
            const statusToRemove = getCharacter(event.target).statuses[event.status]
                .find(s => s.uuid === event.toRemove);
            const stacks = Decimal(statusToRemove.stacks);
            return `${targetName} removed ${stacks.toFixed()} stack${stacks.eq(0)?"":"s"} of ${Statuses[event.status].name}.`;
        }
    }
}