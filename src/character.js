import {getConfigurationValue} from "./config";
import {getGlobalState} from "./engine";
import {Creatures} from "./data/creatures";
import {Decimal} from "decimal.js";
import {Tactics} from "./data/Tactics";
import {DURATION_PERMANENT, Statuses} from "./data/Statuses";
import * as _ from "lodash";
import {Traits} from "./data/Traits";
import getPowerNeededForLevel from "./engine/general/getPowerNeededForLevel";
import evaluateExpression from "./engine/general/evaluateExpression";
import {HitTypes} from "./data/HitTypes";
import * as JOI from "joi";
import calculateCharacterStamina from "./engine/general/calculateCharacterStamina";
import {DamageTypes} from "./data/DamageTypes";
import {enableTutorial} from "./engine/tutorials";

export class Character {
    constructor(props, party) {
        const validation = characterPropsSchema.validate(props);
        if (validation.error) {
            throw new Error(`Character failed validation: ${validation.error}`);
        }
        props = validation.value;
        this.party = party;
        this.tactics = props.tactics || props._tactics;
        this.statuses = props.statuses || {};
        this.adjectives = props.adjectives;
        this.powerLevel = Decimal(props.powerLevel);
        this.isPc = props.isPc;
        this.id = props.id;
        this.name = props.name || props._name;
        this.traits = Object.keys(props.traits || props._traits).reduce((transformed, next) => {
            transformed[next] = Decimal((props.traits || props._traits)[next]);
            return transformed;
        }, {});
        this.absorbedPower = Decimal(props.absorbedPower || props._absorbedPower || 0);
        this.latentPower = Decimal(props.latentPower || props._latentPower || 0);
        this.attributes = new Attributes({...props.attributes}, this);
        this.highestLevelReached = props.highestLevelReached;
        this.highestLevelEnemyDefeated = props.highestLevelEnemyDefeated || 0;
        this.combat = new CombatStats(this, props.combat);
        this.appearance = props.appearance || props._appearance;
        this.lastActedTick = props.lastActedTick || 0;
        this.temporaryTraits = props.temporaryTraits || {};
        this.totalStaminaGainedThisCombat = props.totalStaminaGainedThisCombat;
        this.initiative = props.initiative;

        this.hp = Decimal(props.hp !== undefined ? props.hp : this.maximumHp);
    }

    get perception() {
        const base = Decimal(this.attributes.cunning);
        const traitModifier = Object.keys(this.allTraits).reduce((total, trait) => {
            return total.plus(Decimal(_.get(Traits[trait], "continuous.trigger_effects.self_perception_modifier", 0)).times(this.allTraits[trait]));
        }, Decimal(0));
        return base.plus(traitModifier);
    }

    get deception() {
        const base = Decimal(this.attributes.cunning);
        const traitModifier = Object.keys(this.allTraits).reduce((total, trait) => {
            return total.plus(_.get(Traits[trait], "continuous.trigger_effects.self_deception_modifier", 0));
        }, Decimal(0));
        return base.plus(traitModifier);
    }

    get allTraits() {
        return _.mergeWith({}, this.traits, this.temporaryTraits, function (permanentTrait, temporaryTrait, traitId) {
            return Decimal.max(permanentTrait || 0, temporaryTrait || 0);
        })
    }

    get damageResistances() {
        return Object.keys(DamageTypes).reduce((resistances, nextType) => {
            resistances[nextType] = Object.keys(this.allTraits)
                .reduce((total, nextTrait) => {
                    const damageResistance = _.get(Traits[nextTrait], ["continuous", "trigger_effects", "damage_resistance"], {});
                    const level = Decimal.min(1, Decimal(this.allTraits[nextTrait]).plus(this.attributes.madness.div(10)));
                    return total.plus(damageResistance.type === nextType ? level.times(damageResistance.percentage) : 0);
                }, Decimal(0));
            return resistances;
        }, {});
    }

    levelUp() {
        if (!_.get(getGlobalState(), ["debug", "levelUpDisabled"], false)) {
            this.powerLevel = this.powerLevel.plus(1);
            Creatures[this.appearance].traits.forEach(trait => {
                const gs = getGlobalState();
                gs.unlockedTraits[trait] = this.powerLevel.div(getConfigurationValue("trait_tier_up_levels")).ceil();
            });
        }
    }

    get attackEnhancements() {
        return Object.keys(this.traits)
            .map((trait) => {
                return _.get(Traits[trait], ["attack_enhancement"]) ? {
                    enhancement: _.get(Traits[trait], ["attack_enhancement"]),
                    sourceTrait: trait
                } : null;
            })
            .filter(x => x);
    }

    get defenseEnhancements() {
        return Object.keys(this.traits)
            .map((trait) => {
                return _.get(Traits[trait], ["defense_enhancement"]) ? {
                    enhancement: _.get(Traits[trait], ["defense_enhancement"]),
                    sourceTrait: trait
                } : null;
            })
            .filter(x => x);
    }

    get isDamned() {
        return !Object.keys(this.traits).every(traitId => {
            return _.get(Traits[traitId], ["continuous", "trigger_effects", "is_damned"]) === false;
        })
    }

    clearStatuses() {
        Object.keys(this.statuses).forEach(status => {
            this.statuses[status] = this.statuses[status].filter(instance => instance.duration === DURATION_PERMANENT);
            if (this.statuses[status].length === 0) {
                delete this.statuses[status];
            }
        });
    }

    get energyGeneration() {
        const traitModifier = Object.keys(this.traits).reduce((previousValue, currentValue) => {
            return previousValue.plus(_.get(Traits[currentValue], ["continuous", "trigger_effects", "energy_generation_modifier", "value"], 0));
        }, Decimal(0))
        return this.latentPowerModifier.plus(traitModifier).plus(1).times(this.powerLevel.times(getConfigurationValue("base_power_generated_per_level_per_tick"))).times(this.attributes.cunning);
    }

    getStatusStacks(status) {
        return _.get(this.getActiveStatusInstance(status), "stacks", Decimal(0));
    }

    getActiveStatusInstance(status) {
        return _.get(this.statuses, status, []).reduce((instance, next) => {
            if (instance === null) {
                return next;
            }
            return Decimal(_.get(instance, "ranks", 0)).gt(next.stacks) ? instance : next;
        }, null)
    }

    get isAlive() {
        return Decimal(this.hp).gt(0);
    }

    dealDamage(amount, type) {
        const resistanceMultiplier = this.damageResistances[type] || 1;
        const damageToInflict = Decimal.min(this.hp, Decimal(amount).times(resistanceMultiplier));
        this.hp = Decimal.max(0, this.hp.minus(damageToInflict));
        return damageToInflict;
    }

    get latentPowerCap() {
        return evaluateExpression(getConfigurationValue("latent_power_cap"), {
            highestLevelEnemyDefeated: Decimal(this.highestLevelEnemyDefeated)
        });
    }

    get latentPowerModifier() {
        const effectiveLatentPower = Decimal.min(this.latentPowerCap, this.latentPower);
        return effectiveLatentPower
            .plus(Decimal.max(0, this.latentPower.minus(effectiveLatentPower)).sqrt())
            .times(getConfigurationValue("latent_power_effect_scale")).toDP(2);
    }

    setHp(newHp) {
        this.hp = Decimal.min(this.maximumHp, newHp);
    }

    get attackActionAttributeMultiplier() {
        const attributeModifier = Decimal(getConfigurationValue("precision_effect_per_point"))
            .pow(this.combat.precision);
        return Decimal(1).minus(attributeModifier);
    }

    get defenseActionAttributeMultiplier() {
        const attributeModifier = Decimal(getConfigurationValue("evasion_effect_per_point"))
            .pow(this.combat.evasion);
        return Decimal(1).minus(attributeModifier);
    }

    get statusesAppliedOnBeingHit() {
        return Object.keys(this.traits).reduce((statuses, nextTrait) => {
            const traitDef = _.get(Traits[nextTrait], ["on_taking_damage", "trigger_effects", "add_statuses"], []);
            Object.keys(traitDef).filter(k => traitDef[k].target === "enemy")
                .forEach(status => {
                    statuses[status] = traitDef[status].stacks;
                });
            return statuses;
        }, {})
    }

    get maximumHp() {
        const base = Decimal(0);

        const fromLevel = this.powerLevel.times(getConfigurationValue("health_per_level"));
        const attributeMultiplier = this.attributes[getConfigurationValue("health_modifier_attribute")]
            .times(getConfigurationValue("attribute_health_modifier_scale"));
        const traitMultiplier = Object.keys(this.traits).reduce((previousValue, currentValue) => {
            const traitModifier = _.get(Traits[currentValue], ["continuous", "trigger_effects", "maximum_health_modifier"]);
            return previousValue.plus(_.get(traitModifier, "target") === "self" ? traitModifier.value : 0);
        }, Decimal(0));
        const statusMultiplier = Object.keys(this.statuses).reduce((previousValue, currentValue) => {
            const traitModifier = evaluateExpression(_.get(Statuses, [currentValue, "effects", "maximum_health_modifier", "value"], 0), {
                tiers: this.getStatusStacks(currentValue)
            });
            return previousValue.plus(traitModifier || 0);
        }, Decimal(0));

        const totalMultiplier = attributeMultiplier.plus(traitMultiplier).plus(statusMultiplier).plus(1);

        return Decimal.max(1, base.plus(fromLevel).times(this.latentPowerModifier.plus(1))
            .times(totalMultiplier)).floor();
    }

    reincarnate(newAppearance, newTraits) {
        const newTraitsValidation = newTraitsSchema.validate(newTraits);
        if (newTraitsValidation.error) {
            throw new Error(`Failed validation: ${newTraitsValidation}`);
        }
        this.appearance = newAppearance;
        this.traits = Object.keys(newTraits).reduce((previousValue, currentValue) => {
            if (newTraits[currentValue]) {
                previousValue[currentValue] = getGlobalState().unlockedTraits[currentValue];
            }
            return previousValue;
        }, {});
        Creatures[newAppearance].traits.forEach(trait => {
            this.traits[trait] = Math.max(1, this.traits[trait] || 0);
        });
        this.statuses = {};
        this.absorbedPower = Decimal(0);
        if (!_.get(getGlobalState(), ["debug", "latentPowerGrowthDisabled"], false)) {
            this.latentPower = this.latentPower.plus(this.powerLevel.times(getConfigurationValue("latent_power_per_level")));
            if (this.latentPower.gt(this.latentPowerCap)) {
                enableTutorial("latent-power-cap");
            }
        }
        this.powerLevel = Decimal(1);
        this.hp = this.maximumHp;
        Creatures[this.appearance].traits.forEach(trait => {
            const gs = getGlobalState();
            gs.unlockedTraits[trait] = this.powerLevel.div(getConfigurationValue("trait_tier_up_levels")).ceil();
        });
        this.reset();
        this.combat.stamina = Decimal(0);

    }

    reset() {
        this.hp = this.maximumHp;
        this.clearStatuses();
        this.combat.refresh();
        this.totalStaminaGainedThisCombat = Decimal(0);
    }

    otherDemonIsGreaterDemon(other) {
        const greaterDemonScale = evaluateExpression(getConfigurationValue("greater_level_scale"), {
            player: this,
            enemy: other
        });
        return other.powerLevel.gte(this.powerLevel.plus(greaterDemonScale));
    }

    otherDemonIsLesserDemon(other) {
        const lesserDemonScale = evaluateExpression(getConfigurationValue("lesser_level_scale"), {
            player: this,
            enemy: other
        });
        return other.powerLevel.lte(this.powerLevel.minus(lesserDemonScale));
    }

    gainPower(powerGained) {
        const latentPowerMultiplier = 1// this.latentPowerModifier.plus(1);
        powerGained = powerGained.times(latentPowerMultiplier).floor();
        this.absorbedPower = this.absorbedPower.plus(powerGained);
        while (this.absorbedPower.gte(getPowerNeededForLevel(this.powerLevel.plus(1)))) {
            this.absorbedPower = this.absorbedPower.minus(getPowerNeededForLevel(this.powerLevel.plus(1)));
            this.levelUp()
        }
        return powerGained;
    }

    get healing() {
        const healingPercentage = getConfigurationValue("recovery_action_healing_percentage");
        return Decimal(healingPercentage).times(this.maximumHp).ceil();
    }

    refreshBeforeCombat() {
        this.clearStatuses();
        this.combat.fatigue = Decimal(0);
        this.lastActedTick = 0;
        this.initiative = 0;
    }

    get canBeAttacked() {
        return Object.keys(this.statuses).reduce((canBeAttacked, nextStatus) => {
            const statusDefTarget = _.get(Statuses[nextStatus], ["effects", "untargetable", "target"]);
            return canBeAttacked && statusDefTarget !== "self";
        }, true)
    }

    get isInscrutable() {
        return Object.keys(this.traits).reduce((isInscrutable, nextStatus) => {
            const statusDefTarget = _.get(Traits[nextStatus], ["continuous", "trigger_effects", "inscrutable", "target"]);
            return isInscrutable || statusDefTarget === "self";
        }, false)
    }

    get canNegotiate() {
        return this.powerLevel.gte(26);
    }

    get damage() {
        return this.combat.damage;
    }
}

export class Attributes {
    constructor(attributes, character) {
        Object.defineProperty(this, "character", {
            value: character
        });
        this.baseBrutality = Decimal(attributes.baseBrutality || getConfigurationValue("minimum_attribute_score"));
        this.baseCunning = Decimal(attributes.baseCunning || getConfigurationValue("minimum_attribute_score"));
        this.baseDeceit = Decimal(attributes.baseDeceit || getConfigurationValue("minimum_attribute_score"));
        this.baseMadness = Decimal(attributes.baseMadness || getConfigurationValue("minimum_attribute_score"));
    }

    get brutality() {
        return calculateEffectiveAttribute(this.baseBrutality, this.character.latentPowerModifier)
    }

    get cunning() {
        return calculateEffectiveAttribute(this.baseCunning, this.character.latentPowerModifier)
    }

    get deceit() {
        return calculateEffectiveAttribute(this.baseDeceit, this.character.latentPowerModifier)
    }

    get madness() {
        return calculateEffectiveAttribute(this.baseMadness, this.character.latentPowerModifier)
    }
}

export function calculateEffectiveAttribute(baseAttribute, characterLatentPower) {
    const latentPowerModifier = characterLatentPower.plus(1);

    return Decimal(baseAttribute)
        //.times(latentPowerModifier)
        ;

}

class CombatStats {
    constructor(character, overrides) {
        Object.defineProperty(this, "character", {
            value: character
        });
        this.fatigue = Decimal(overrides.fatigue || 0);
        this.stamina = Decimal(overrides.stamina || 0);
        this.reserve = Decimal(overrides.reserve || this.maximumStamina);
    }

    refresh() {
        this.fatigue = Decimal(0);
        this.reserve = this.maximumStamina;
    }

    get damage() {
        const baseDamage = this.character.powerLevel.times(getConfigurationValue("damage_per_level"));
        return Object.keys(HitTypes).reduce(((previousValue, currentValue) => {

            const hitTypeMultiplier = HitTypes[currentValue].damageMultiplier;
            previousValue[currentValue] = Decimal(baseDamage)
                .times(hitTypeMultiplier).ceil();
            return previousValue;
        }), {})
    }

    get staminaRecovery() {
        const recoveryPerLevel = getConfigurationValue("stamina_recovery_per_level");
        const fatigueModifier = Decimal(1)//.minus(Decimal(this.fatigue).times(getConfigurationValue("fatigue_penalty_per_point")));
        return Decimal.max(0, Decimal(this.character.powerLevel).times(recoveryPerLevel)
            .times(fatigueModifier).floor());
    }

    get receivedDamageMultiplier() {
        return Object.keys(this.character.statuses).reduce((previousValue, currentValue) => {
            const statusModifier = _.get(Statuses[currentValue], ["effects", "damage_modifier", "target"]) === "self" ? Statuses[currentValue].effects.damage_modifier.value : 0;
            const statusRank = this.character.getStatusStacks(currentValue);
            const modifier = Decimal.max(0, Decimal(statusModifier).pow(statusRank).minus(1));
            return previousValue.plus(modifier || 0);
        }, Decimal(1));
    }

    get evasion() {
        return calculateCombatStat(this.character, "evasion");
    }

    get precision() {
        return calculateCombatStat(this.character, "precision");
    }

    get resilience() {
        return calculateCombatStat(this.character, "resilience");
    }

    get maximumStamina() {
        return calculateCharacterStamina(this.character.powerLevel, this.fatigue, Decimal(this.character.latentPowerModifier), this.character.traits);
    }

    get unmodifiedMaximumStamina() {
        return calculateCharacterStamina(this.character.powerLevel, 0, Decimal(this.character.latentPowerModifier), this.character.traits);
    }

    get power() {
        return calculateCombatStat(this.character, "power");
    }
}

export function calculateCombatStat(character, combatAttribute) {
    const attributeBase = character.attributes[getConfigurationValue(`${combatAttribute}_base_attribute`)];
    const tacticsModifier = Decimal(0);
    const statusesModifier = Object.keys(character.statuses).reduce((currentValue, nextStatus) => {
        const statusDefinition = Statuses[nextStatus];
        return currentValue.plus(_.get(statusDefinition, ["effects", `${combatAttribute}_modifier`, "value"], 0));
    }, Decimal(0));
    const traitModifier = Object.keys(character.traits).reduce((previousValue, trait) => {
        const traitDefinition = Traits[trait];
        if (_.get(traitDefinition, ["continuous", "trigger_effects", `${combatAttribute}_modifier`, "target"]) === "self") {
            return previousValue.plus(evaluateExpression(_.get(traitDefinition, ["continuous", "trigger_effects", `${combatAttribute}_modifier`, "value"]), {
                tier: Decimal(character.traits[trait])
            }));
        }
        return previousValue;
    }, Decimal(0));
    return attributeBase.times(tacticsModifier.plus(statusesModifier).plus(traitModifier).plus(1));
}

const characterPropsSchema = JOI.object({
    id: JOI.number().required(),
    lastActedTick: JOI.number(),
    temporaryTraits: JOI.object().default({}),
    loyalty: JOI.string().default("none"),
    totalStaminaGainedThisCombat: JOI.alternatives().try(JOI.object().instance(Decimal), JOI.string(), JOI.number()).default(Decimal(0)),
    attributes: JOI.alternatives().try(
        JOI.object({
            baseBrutality: JOI.alternatives().try(JOI.number(), JOI.string(), JOI.object().instance(Decimal)),
            baseCunning: JOI.alternatives().try(JOI.number(), JOI.string(), JOI.object().instance(Decimal)),
            baseDeceit: JOI.alternatives().try(JOI.number(), JOI.string(), JOI.object().instance(Decimal)),
            baseMadness: JOI.alternatives().try(JOI.number(), JOI.string(), JOI.object().instance(Decimal)),
        }),
        JOI.object({
            _baseBrutality: JOI.alternatives().try(JOI.number(), JOI.string(), JOI.object().instance(Decimal)),
            _baseCunning: JOI.alternatives().try(JOI.number(), JOI.string(), JOI.object().instance(Decimal)),
            _baseDeceit: JOI.alternatives().try(JOI.number(), JOI.string(), JOI.object().instance(Decimal)),
            _baseMadness: JOI.alternatives().try(JOI.number(), JOI.string(), JOI.object().instance(Decimal)),
        })
    ).default({baseBrutality: Decimal(1), baseCunning: Decimal(1), baseDeceit: Decimal(1), baseMadness: Decimal(1)}),
    powerLevel: JOI.alternatives().try(JOI.string(), JOI.object().instance(Decimal), JOI.number()).default(Decimal(1)),
    statuses: JOI.object().default({}),
    highestLevelReached: JOI.alternatives().try(JOI.number(), JOI.object().instance(Decimal), JOI.string())
        .default(Decimal(1)),
    highestLevelEnemyDefeated: JOI.alternatives().try(JOI.number(), JOI.object().instance(Decimal), JOI.string())
        .default(Decimal(0)),
    isPc: JOI.boolean().default(false),
    name: JOI.string(),
    appearance: JOI.string().empty(''),
    traits: JOI.object().default({}),
    tactics: JOI.object({
        offensive: JOI.valid(...Object.keys(Tactics.offensive)).default("attrit"),
        defensive: JOI.valid(...Object.keys(Tactics.defensive)).default("block"),
    }).default({offensive: "attrit", defensive: "block"}),
    combat: JOI.object({
        stamina: JOI.alternatives().try(JOI.string(), JOI.object().instance(Decimal), JOI.number()),
        precisionPoints: JOI.alternatives().try(JOI.string(), JOI.number(), JOI.object().instance(Decimal)),
        evasionPoints: JOI.alternatives().try(JOI.string(), JOI.number(), JOI.object().instance(Decimal)),
        fatigue: JOI.alternatives().try(JOI.string(), JOI.number(), JOI.object().instance(Decimal)),
        reserve: JOI.alternatives().try(JOI.string(), JOI.number(), JOI.object().instance(Decimal)),
    }).default({}),
    adjectives: JOI.array().items(JOI.string()),
    absorbedPower: JOI.alternatives().try(JOI.string(), JOI.object().instance(Decimal), JOI.number())
        .default(Decimal(0)),
    hp: JOI.alternatives().try(JOI.string(), JOI.number(), JOI.object().instance(Decimal)),
    party: JOI.number(),
    latentPower: JOI.alternatives().try(JOI.string(), JOI.object().instance(Decimal)),
    enabled: JOI.boolean(),
    texture: JOI.string(),
    description: JOI.string(),
    isRival: JOI.boolean(),
    damageResistances: JOI.object({
        acid: JOI.alternatives().try(JOI.string(), JOI.number(), JOI.object().instance(Decimal)),
        physical: JOI.alternatives().try(JOI.string(), JOI.number(), JOI.object().instance(Decimal)),
        fire: JOI.alternatives().try(JOI.string(), JOI.number(), JOI.object().instance(Decimal)),
        ice: JOI.alternatives().try(JOI.string(), JOI.number(), JOI.object().instance(Decimal)),
        psychic: JOI.alternatives().try(JOI.string(), JOI.number(), JOI.object().instance(Decimal)),
    }),
    initiative: JOI.number().default(0),
    lastAction: JOI.string()
});

const newTraitsSchema = JOI.object().pattern(JOI.string(), JOI.boolean());