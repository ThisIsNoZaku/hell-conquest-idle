import {debugMessage} from "../../debugging";
import {Traits} from "../../data/Traits";
import * as JOI from "joi";
import doesTraitTrigger from "../combat/events/doesTraitTrigger";
import applyEffects from "../combat/events/applyEffects";
import selectConditionTargets from "../combat/events/selectConditionTargets";
import {Statuses} from "../../data/Statuses";
import {generateDamageEvent} from "../events/generate";
import {Decimal} from "decimal.js";
import {getCharacter} from "../index";
import * as _ from "lodash";
import {ActionEnhancements} from "../../data/ActionEnhancements";
import {Events} from "../../data/Events";

export default function triggerEvent(event) {
    const eventValidation = eventMatcher.validate(event);
    if (eventValidation.error) {
        throw new Error(`Invalid event shape: ${eventValidation.error}`);
    }
    const eventDef = Events[event.type];
    // Trigger traits for event
    debugMessage(`Triggering event ${event.type}`);

    const eventTargets = eventDef.receivers === "all" ? Object.values(event.combatants) :
        (eventDef.receivers === "source" ? [event.source.character] : Object.values(event.combatants).filter(c => c !== event.source.character));

    eventTargets.filter(x => x).forEach(combatant => {
        Object.keys(_.get(combatant, "traits", {})).forEach(traitId => {
            const trait = Traits[traitId];
            const eventDefinition = trait[event.type];
            if (eventDefinition) {
                const traitTriggered = doesTraitTrigger(eventDefinition, event, combatant);
                debugMessage(`Trait ${traitId} did ${traitTriggered ? '' : 'not'} trigger.`);
                const effectsToApply = eventDefinition[traitTriggered ? "trigger_effects" : "not_trigger_effects"];
                if (effectsToApply) {
                    applyEffects(effectsToApply, combatant, event, "trait", traitId, combatant.traits[traitId]);
                }
            }
        });
        Object.keys(_.get(combatant, "statuses", {})).forEach(statusId => {
            const status = Statuses[statusId];
            Object.keys(status.effects).forEach(effect => {
                switch (effect) {
                    case "inflict_damage_at_start_of_round":
                        if (event.type !== "on_round_begin") {
                            return;
                        }
                        const targets = selectConditionTargets(status.effects[effect].target, combatant, event.target, event.combatants);
                        targets.forEach(target => {
                            const activeStatus = target.getActiveStatusInstance(statusId);
                            const damageToDeal = Decimal(status.effects[effect].value)
                                .times(target.getStatusStacks(statusId))
                                .times(getCharacter(activeStatus.source.character).powerLevel)
                                .floor();
                            target.dealDamage(damageToDeal);
                            const damageEvent = generateDamageEvent(getCharacter(activeStatus.source.character), target, damageToDeal, status.effects[effect].damageType, statusId);
                            event.roundEvents.push(damageEvent);
                            triggerEvent({
                                type: "on_taking_damage",
                                source: {
                                    character: combatant,
                                    status: statusId,
                                    damage: damageEvent
                                },
                                target: combatant,
                                combatants: event.combatants,
                                roundEvents: event.roundEvents
                            })
                        })
                        break;
                }
            })
        })
    });

    _.get(event.source, ["attack", "action", "enhancements"], []).forEach(enhancement => {
        const enhancementDef = ActionEnhancements[enhancement.enhancement];
        const eventDefinition = enhancementDef[event.type];
        if (eventDefinition) {
            const traitTriggered = doesTraitTrigger(eventDefinition, event);
            debugMessage(`Enhancement ${enhancement.id} did ${traitTriggered ? '' : 'not'} trigger.`);
            const effectsToApply = eventDefinition[traitTriggered ? "trigger_effects" : "not_trigger_effects"];
            if (effectsToApply) {
                applyEffects(effectsToApply, event.source.character, event, "enhancement", enhancement.enhancement, event.source.character.traits[enhancement.sourceTrait]);
            }
        }
    });

    _.get(event.source, ["attack", "reaction", "enhancements"], []).forEach(enhancement => {
        const enhancementDef = ActionEnhancements[enhancement.enhancement];
        const eventDefinition = enhancementDef[event.type];
        if (eventDefinition) {
            const traitTriggered = doesTraitTrigger(eventDefinition, event);
            debugMessage(`Enhancement ${enhancement.id} did ${traitTriggered ? '' : 'not'} trigger.`);
            const effectsToApply = eventDefinition[traitTriggered ? "trigger_effects" : "not_trigger_effects"];
            if (effectsToApply) {
                applyEffects(effectsToApply, event.source.character, event, "enhancement", enhancement.enhancement, event.source.character.traits[enhancement.sourceTrait]);
            }
        }
    });
}

const eventMatcher = JOI.object({
    type: JOI.valid("on_status_applied", "on_kill", "on_taking_damage", "on_round_begin", "on_round_end", "on_miss", "on_hit", "on_minor_hit", "on_glancing_hit", "on_solid_hit", "on_serious_hit", "on_devastating_hit", "on_combat_start", "on_dodge").required(),
    combatants: JOI.object().required(),
    roundEvents: JOI.array().required(),
    source: JOI.any().when("type", {
        is: ["on_status_applied", "on_kill", "on_taking_damage","on_miss", "on_hit", "on_minor_hit", "on_glancing_hit", "on_solid_hit", "on_serious_hit", "on_devastating_hit", "on_dodge"],
        then: JOI.object({
            character: JOI.object().required(),
            attack: JOI.object(),
            damage: JOI.object(),
            trait: JOI.string(),
            status: JOI.string()
        }).required(),
        otherwise: JOI.any().forbidden()
    }).required(),
    target: JOI.any().when("type", {
        is: [
            "on_status_applied_to_self",
            "on_status_applied_to_enemy",
            "on_kill",
            "on_taking_damage",
            "on_miss",
            "on_hit",
            "on_minor_hit",
            "on_glancing_hit",
            "on_solid_hit",
            "on_serious_hit",
            "on_devastating_hit"],
        then: JOI.object(),
        otherwise: JOI.any().strip()
    }),
    status: JOI.any().when("type", {
        is: 'on_status_applied',
        then: JOI.string().valid(...Object.keys(Statuses))
    }),
    stacks: JOI.any().when("type", {
        is: 'on_status_applied',
        then: JOI.alternatives().try(JOI.number(), JOI.object().instance(Decimal))
    }),
    duration: JOI.any().when("type", {
        is: 'on_status_applied',
        then: JOI.alternatives().try(JOI.number(), JOI.object().instance(Decimal))
    })
});