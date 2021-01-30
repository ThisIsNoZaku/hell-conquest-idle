import {getConfigurationValue} from "../../../config";
import { DefenseActions} from "../../../data/CombatActions";
import {Decimal} from "decimal.js";
import {Traits} from "../../../data/Traits";
import * as _ from "lodash";

export default function calculateReactionCost(actor, reaction, target) {
    const base = actor.powerLevel.times(getConfigurationValue("attack_upgrade_cost_per_enemy_level"));
    const attributeMultiplier = Decimal(1).minus(target.combat.evasion.times(getConfigurationValue("mechanics.combat.evasion.effectPerPoint")));
    const actionCostMultiplier = DefenseActions[reaction.primary].energyCostMultiplier;
    const attackerTraitModifier = Object.keys(actor.traits).reduce((previousValue, currentValue) => {
        const modifier = _.get(Traits[currentValue], ["continuous", "trigger_effects", `${reaction.primary}_cost_modifier`], 0);
        const applies = _.get(modifier, "target") === "any" || _.get(modifier, "target") === "enemy";
        return previousValue.plus(applies ? Decimal(modifier.value).times(actor.traits[currentValue]) : 0);
    }, Decimal(0));
    return base.times(actionCostMultiplier)
        .times(attributeMultiplier.plus(attackerTraitModifier))
        .floor();

}