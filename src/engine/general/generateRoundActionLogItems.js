import {getCharacter} from "../index";
import {Statuses} from "../../data/Statuses";
import {Decimal} from "decimal.js";
import {HitTypes} from "../../data/HitTypes";
import {AttackActions, DefenseActions} from "../../data/CombatActions";
import {enableTutorial} from "../tutorials";

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
    const targetName = event.target !== undefined ? getCharacter(event.target).name : null;
    switch (event.event) {
        case "stamina-change":
            return `${targetName} ${event.value.lt(0) ? 'lost' : 'gained'} ${event.value} energy`;
        case "kill":
            return `<strong>${targetName} died!</strong>`
        case "attack":
            const base = event.hit ? `${sourceName} used ${event.actionEnergyCost} Energy for a ${AttackActions[event.action.primary].name} and scored a ${HitTypes[event.hitType].type} hit!` : `${sourceName} used ${event.actionEnergyCost} Energy for a ${AttackActions[event.action.primary].name} attack but missed!`;
            const reaction = event.reaction.primary !== "none" ? `${event.reactionEnergyCost} Energy was used to ${DefenseActions[event.reaction.primary].name} the attack.` : null;
            return [base, reaction].filter(e => e !== null).join(" ");
        case "damage":
            return `${targetName} ${event.target === 0 ? 'take' : 'takes'} ${event.value.toFixed()} damage.`;
        case "fatigue-damage":
            const damage = Decimal(event.value);
            return `${targetName} lose${targetName === "You" ? "" : "s"} ${damage.toFixed()} health from Energy Burn.`;
        case "add-status":
            const numStacks = Decimal(event.stacks);
            const duration = Decimal(event.duration);
            const durationDescription = event.duration === -1 ? 'permanently.' : `for ${event.duration} action${duration.eq(1) ? "" : "s"}.`;
            return `${targetName} gained ${numStacks.toFixed()} stack${numStacks.eq(1) ? "" : "s"} of ${Statuses[event.status].name} ${durationDescription}`;
        case "remove-status": {
            const stacks = Decimal(event.stacks);
            return `${targetName} removed ${stacks.toFixed()} stack${stacks.eq(0)?"":"s"} of ${Statuses[event.status].name}.`;
        }
        case "action-skipped": {
            const base = `${sourceName} did not act`
            let reason = event.reason ? " " + event.reason : "" ;
            return base + reason + ".";
        }
    }
}