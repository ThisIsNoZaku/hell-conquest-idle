import {Decimal} from "decimal.js";
import * as _ from "lodash";
import { config } from "../../config";
import {debugMessage} from "../../debugging";
import {defaultMergeProps} from "react-redux/lib/connect/mergeProps";

export default function calculateDamageBy(attacker) {
    return {
        against: function (target, debugOutput) {
            const attackerPower = attacker.combat.power;
            const powerMultiplier = Decimal(config.mechanics.combat.power.effectPerPoint).plus(1)
                .pow(attackerPower);
            debugMessage(`Attacker ${attacker.id} has power ${attackerPower} for multiplier ${powerMultiplier}.`);
            const defenderResilience = _.get(target, ["combat", "resilience"], 0);
            const resilienceMultiplier = Decimal(1).minus(config.mechanics.combat.power.effectPerPoint)
                .pow(defenderResilience);
            if(target) {
                debugMessage(`Defender ${target.id} has resilience ${defenderResilience} for multiplier ${resilienceMultiplier}.`);
            } else {
                debugMessage(`No target means an effective resilience of ${defenderResilience} and a multiplier of ${resilienceMultiplier}`)
            }
            const damageModifier = powerMultiplier.times(resilienceMultiplier);
            debugMessage(`Final damage multiplier = ${damageModifier}. Min: ${attacker.combat.minimumDamage.times(damageModifier).ceil()} Med: ${attacker.combat.medianDamage.times(damageModifier).ceil()} Max: ${attacker.combat.maximumDamage.times(damageModifier).ceil()}`);
            return {
                min: attacker.combat.minimumDamage.times(damageModifier).ceil(),
                med: attacker.combat.medianDamage.times(damageModifier).ceil(),
                max: attacker.combat.maximumDamage.times(damageModifier).ceil()
            }
        }
    }

}