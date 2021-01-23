import {Decimal} from "decimal.js";
import * as _ from "lodash";
import {getConfigurationValue} from "../../config";
import {debugMessage} from "../../debugging";
import {HitTypes} from "../../data/HitTypes";
import {Traits} from "../../data/Traits";
import evaluateExpression from "../general/evaluateExpression";
import {Tactics} from "../../data/Tactics";

export default function calculateDamageBy(attacker) {
    return {
        against: function (target, debugOutput) {
            const attackerPower = Decimal(_.get(attacker, ["combat", "power"], 0));
            debugMessage(`Attacker ${_.get(attacker, "id")} has power ${attackerPower}.`);
            const defenderResilience = Decimal(_.get(target, ["combat", "resilience"], attackerPower));

            if(target) {
                debugMessage(`Defender ${target.id} has resilience ${defenderResilience}.`);
            } else {
                debugMessage(`No target means an effective resilience of ${defenderResilience}`)
            }
            Decimal.set({rounding: Decimal.ROUND_DOWN});
            const attributeDifference = Decimal.min(10, Decimal.max(-10, attackerPower.minus(defenderResilience))).round().toFixed();
            const enemyReceivedDamageMultiplier = _.get(target, "combat.receivedDamageMultiplier", Decimal(1)).minus(1);
            const damageModifier = Decimal(getConfigurationValue("mechanics.combat.attributeDifferenceMultipliers")[attributeDifference])
                .plus(enemyReceivedDamageMultiplier);
            debugMessage(`Final damage multiplier = ${damageModifier}.`);
            const attackerPowerLevel = Decimal(_.get(attacker, "powerLevel", 0));
            return Object.keys(HitTypes).reduce((damage, nextType) => {
                const perLevelDamage = getConfigurationValue("damage_per_level");
                const hitTypeDamageMultiplier = HitTypes[nextType].damageMultiplier;
                const traitDamageMultiplier = Object.keys(_.get(attacker, "traits", {})).reduce((previousValue, currentValue) => {
                    const traitDamageMultiplier = evaluateExpression(_.get(Traits[currentValue], ["continuous", 'trigger_effects', `${HitTypes[nextType].summary}_hit_damage_multiplier`, "modifier"], 0), {
                        tier: Decimal(attacker.traits[currentValue])
                    });
                    return previousValue.plus(traitDamageMultiplier)
                }, Decimal(1));
                const tacticsMultiplier = Decimal(1).plus(_.get(Tactics, [_.get(attacker, "tactics"), "modifiers", `${HitTypes[nextType].summary}_hit_damage_multiplier`], 0));
                damage[nextType] = attackerPowerLevel.times(perLevelDamage)
                    .times(damageModifier)
                    .times(hitTypeDamageMultiplier)
                    .times(tacticsMultiplier)
                    .times(traitDamageMultiplier)
                    .floor();
                return damage;
            }, {
                base: Decimal(_.get(attacker, ["combat", "medianDamage"], 0)),
                multiplier: damageModifier
            })
        }
    }

}