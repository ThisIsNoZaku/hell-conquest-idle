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
        using: function (attack) {
            return {
                against: function (target, debugOutput) {
                    return {
                        using: function (reaction) {
                            const attackerPower = Decimal(_.get(attacker, ["combat", "power"], 0));
                            debugMessage(`Attacker ${_.get(attacker, "id")} has power ${attackerPower}.`);
                            const defenderResilience = Decimal(_.get(target, ["combat", "resilience"], attackerPower));

                            if (target) {
                                debugMessage(`Defender ${target.id} has resilience ${defenderResilience}.`);
                            } else {
                                debugMessage(`No target means an effective resilience of ${defenderResilience}`)
                            }
                            Decimal.set({rounding: Decimal.ROUND_DOWN});
                            const attributeDifference = Decimal.min(10, Decimal.max(-10, attackerPower.minus(defenderResilience))).round().toFixed();
                            const enemyReceivedDamageMultiplier = _.get(target, "combat.receivedDamageMultiplier", Decimal(1)).minus(1);
                            const attributeDamageMultiplier = Decimal(getConfigurationValue("mechanics.combat.attributeDifferenceMultipliers")[attributeDifference])
                                .plus(enemyReceivedDamageMultiplier);
                            debugMessage(`Final damage multiplier = ${attributeDamageMultiplier}.`);
                            const attackerPowerLevel = Decimal(_.get(attacker, "powerLevel", 0));
                            return Object.keys(HitTypes).reduce((damage, nextType) => {
                                const perLevelDamage = getConfigurationValue("damage_per_level");
                                const hitTypeDamageMultiplier = HitTypes[nextType].damageMultiplier;
                                const attackerTraitDamageMultiplier = Object.keys(_.get(attacker, "traits", {})).reduce((previousValue, currentValue) => {
                                    const traitEffectDefinition = _.get(Traits[currentValue], ["continuous", 'trigger_effects', `${HitTypes[nextType].summary}_hit_damage_multiplier`],
                                        _.get(Traits[currentValue], ["continuous", 'trigger_effects', `damage_modifier`]));
                                    const traitApplies = _.get(traitEffectDefinition, ["target"]) === "all" || _.get(traitEffectDefinition, ["target"]) === "self";
                                    return previousValue.plus(traitApplies ? Decimal(traitEffectDefinition.value).times(attacker.traits[currentValue]) : 0);
                                }, Decimal(0));
                                const defenderTraitDamageMultiplier = Object.keys(_.get(target, "traits", {})).reduce((previousValue, currentValue) => {
                                    const traitEffectDefinition = _.get(Traits[currentValue], ["continuous", 'trigger_effects', `${HitTypes[nextType].summary}_hit_damage_multiplier`],
                                        _.get(Traits[currentValue], ["continuous", 'trigger_effects', `damage_modifier`]));
                                    const traitApplies = _.get(traitEffectDefinition, ["target"]) === "all" || _.get(traitEffectDefinition, ["target"]) === "enemy";
                                    return previousValue.plus(traitApplies ? Decimal(traitEffectDefinition.value).times(target.traits[currentValue]) : 0);
                                }, Decimal(0));
                                const attackerTacticsMultiplier = Decimal(0).plus(_.get(Tactics, [_.get(attacker, "tactics"), "modifiers", `${HitTypes[nextType].summary}_hit_damage_multiplier`], 0));
                                const defenderTacticsMultiplier = Decimal(0).plus(_.get(Tactics, [_.get(target, "tactics"), "modifiers", `${HitTypes[nextType].summary}_hit_received_damage_multiplier`], 0));

                                const reactionEnhancementModifier = reaction.enhancements.reduce((previousValue, currentValue) => {
                                    return previousValue + (currentValue[`additional_${reaction.primary}_damage_reduction`] || 0);
                                }, 0);

                                const totalMultiplier = Decimal(attributeDamageMultiplier)
                                    .plus(attackerTraitDamageMultiplier)
                                    .plus(reactionEnhancementModifier)
                                    .plus(defenderTraitDamageMultiplier);
                                const latentPowerModifier = Decimal(_.get(attacker, "latentPowerModifier", 0)).plus(1);
                                damage[nextType] = Decimal.max(0, attackerPowerLevel.times(perLevelDamage)
                                    .times(hitTypeDamageMultiplier)
                                    .times(latentPowerModifier)
                                    .times(totalMultiplier))
                                    .floor();
                                return damage;
                            }, {})
                        }
                    }
                }
            }
        }
    }

}