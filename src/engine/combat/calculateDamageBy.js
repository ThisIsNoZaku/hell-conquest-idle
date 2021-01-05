import {Decimal} from "decimal.js";
import * as _ from "lodash";
import { config } from "../../config";
import {debugMessage} from "../../debugging";
import {defaultMergeProps} from "react-redux/lib/connect/mergeProps";
import {DeckOutlined} from "@material-ui/icons";

export default function calculateDamageBy(attacker) {
    return {
        against: function (target, debugOutput) {
            const attackerPower = attacker.combat.power;
            const powerMultiplier = Decimal.min(Decimal(config.mechanics.combat.power.effectPerPoint).plus(1)
                .pow(attackerPower), 100);
            debugMessage(`Attacker ${attacker.id} has power ${attackerPower} for multiplier ${powerMultiplier}.`);
            const defenderResilience = _.get(target, ["combat", "resilience"], attackerPower);
            const resilienceMultiplier = Decimal.max(Decimal(1).minus(config.mechanics.combat.power.effectPerPoint)
                .pow(defenderResilience), 0.01);
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