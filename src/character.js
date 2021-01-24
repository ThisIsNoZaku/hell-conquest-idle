import {getConfigurationValue} from "./config";
import {getCharacter, getGlobalState} from "./engine";
import {Creatures} from "./data/creatures";
import {Decimal} from "decimal.js";
import {Tactics} from "./data/Tactics";
import {PERMANENT, Statuses} from "./data/Statuses";
import * as _ from "lodash";
import {Traits} from "./data/Traits";
import getPowerNeededForLevel from "./engine/general/getPowerNeededForLevel";
import evaluateExpression from "./engine/general/evaluateExpression";
import {HitTypes} from "./data/HitTypes";
import * as JOI from "joi";
import calculateCharacterStamina from "./engine/general/calculateCharacterStamina";

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

        this.hp = Decimal(props.hp !== undefined ? props.hp : this.maximumHp);
    }

    levelUp() {
        this.powerLevel = this.powerLevel.plus(1);
        Creatures[this.appearance].traits.forEach(trait => {
            getGlobalState().unlockedTraits[trait] = this.powerLevel.div(10).ceil();
        });
    }

    clearStatuses() {
        Object.keys(this.statuses).forEach(status => {
            this.statuses[status] = this.statuses[status].filter(instance => instance.duration === PERMANENT);
            if(this.statuses[status].length === 0) {
                delete this.statuses[status];
            }
        });
    }

    getStatusStacks(status) {
        return _.get(this.getActiveStatusInstance(status), "stacks", Decimal(0));
    }

    getActiveStatusInstance(status) {
        return this.statuses[status].reduce((instance, next) => {
            return Decimal(_.get(instance, "ranks", 0)).gt(next.stacks) ? instance : next;
        }, null)
    }

    setHp(newHealth) {
        if (this.maximumHp.lt(newHealth)) {
            this.hp = this.maximumHp;
        } else {
            this.hp = newHealth;
        }
    }

    get isAlive() {
        return Decimal(this.hp).gt(0);
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

    get maximumHp() {
        const base = Decimal(getConfigurationValue("mechanics.combat.hp.baseHp"));
        const fromLevel = this.powerLevel.times(getConfigurationValue("mechanics.combat.hp.pointsPerLevel"));
        const attributeMultiplier = this.attributes[getConfigurationValue("mechanics.combat.hp.baseAttribute")]
            .times(getConfigurationValue("mechanics.combat.hp.effectPerPoint")).plus(1);
        const traitMultiplier = Object.keys(this.traits).reduce((previousValue, currentValue) => {
            const traitModifier = _.get(Traits[currentValue], ["continuous", "trigger_effects", "maximum_health_modifier"]);
            return previousValue.plus(_.get(traitModifier, "target") === "self" ? evaluateExpression(traitModifier.modifier, {
                tier: this.traits[currentValue]
            }) : 0);
        }, Decimal(1));
        const statusMultiplier = Object.keys(this.statuses).reduce((previousValue, currentValue) => {
            const traitModifier = evaluateExpression(_.get(Statuses, [currentValue, "effects", "maximum_health_modifier", "modifier"], 0), {
                tiers: this.getStatusStacks(currentValue)
            });
            return previousValue.plus(traitModifier || 0);
        }, Decimal(1));

        return base.plus(fromLevel)
            .plus(this.isPc ? getConfigurationValue("mechanics.combat.hp.pcBonus") : 0)
            .times(attributeMultiplier)
            .times(traitMultiplier)
            .times(statusMultiplier)
            .floor();
    }

    reincarnate(newAppearance, newTraits) {
        const newTraitsValidation = newTraitsSchema.validate(newTraits);
        if(newTraitsValidation.error) {
            throw new Error(`Failed validation: ${newTraitsValidation}`);
        }
        this.appearance = newAppearance;
        this.traits = Object.keys(newTraits).reduce((previousValue, currentValue) => {
            if(newTraits[currentValue]) {
                previousValue[currentValue] = getGlobalState().unlockedTraits[currentValue];
            }
            return previousValue;
        }, {});
        Creatures[newAppearance].traits.forEach(trait => {
            this.traits[trait] = Math.max(1, this.traits[trait] || 0);
        });
        this.statuses = {};
        this.absorbedPower = Decimal(0);
        this.powerLevel = Decimal(1);
        this.combat.stamina = this.combat.maximumStamina;
        this.reset();
    }

    reset() {
        this.hp = this.maximumHp;
        this.clearStatuses();
        this.combat.refresh();
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
        const latentPowerMultiplier = this.latentPowerModifier.plus(1);
        powerGained = powerGained.times(latentPowerMultiplier).floor();
        this.absorbedPower = this.absorbedPower.plus(powerGained);
        while(this.absorbedPower.gte(getPowerNeededForLevel(this.powerLevel.plus(1)))) {
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
        return evaluateExpression(getConfigurationValue("mechanics.combat.effectiveAttributeCalculation"), {
            baseAttribute: this.baseBrutality,
            stolenPowerModifier: Decimal(this.character.latentPowerModifier).plus(1)
        }).floor();
    }

    get cunning() {
        return evaluateExpression(getConfigurationValue("mechanics.combat.effectiveAttributeCalculation"), {
            baseAttribute: this.baseCunning,
            stolenPowerModifier: Decimal(this.character.latentPowerModifier).plus(1)
        }).floor();
    }

    get deceit() {
        return evaluateExpression(getConfigurationValue("mechanics.combat.effectiveAttributeCalculation"), {
            baseAttribute: this.baseDeceit,
            stolenPowerModifier: Decimal(this.character.latentPowerModifier).plus(1)
        }).floor();
    }

    get madness() {
        return evaluateExpression(getConfigurationValue("mechanics.combat.effectiveAttributeCalculation"), {
            baseAttribute: this.baseMadness,
            stolenPowerModifier: Decimal(this.character.latentPowerModifier).plus(1)
        }).floor();
    }
}

class CombatStats {
    constructor(character, overrides) {
        Object.defineProperty(this, "character", {
            value: character
        });
        this.stamina = Decimal(overrides.stamina || this.maximumStamina);
    }

    refresh() {

    }

    get damage() {
        return Object.keys(HitTypes).reduce(((previousValue, currentValue) => {
            const baseDamage = evaluateExpression(getConfigurationValue("mechanics.combat.baseDamage"), {
                player: this.character
            });
            const hitTypeMultiplier = HitTypes[currentValue].damageMultiplier;
            previousValue[currentValue] = Decimal(baseDamage)
                .times(hitTypeMultiplier).ceil();
            return previousValue;
        }), {})
    }

    get receivedDamageMultiplier() {
        return Object.keys(this.character.statuses).reduce((previousValue, currentValue) => {
            const statusModifier = _.get(Statuses[currentValue], ["effects", "damage_modifier", "target"]) === "self" ? Statuses[currentValue].effects.damage_modifier.modifier : 0;
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
        return calculateCharacterStamina(this.character.powerLevel, this.character.traits);
    }

    get power() {
        return calculateCombatStat(this.character, "power");
    }

    get attackUpgradeCost() {
        const base = Decimal(getConfigurationValue("base_attack_upgrade_cost"));
        const tacticsCostMultiplier = Tactics[this.character.tactics].modifiers.attack_upgrade_cost_multiplier || 1;
        const statusesCostMultiplier = Object.keys(this.character.statuses).reduce((total, next) => {
            return total.plus(Statuses[next].attack_upgrade_cost_multiplier || 0);
        }, Decimal(1));
        const precisionEffectScale = getConfigurationValue("mechanics.combat.precision.effectPerPoint");
        const attributeMultiplier = Decimal(1).minus(this.precision.times(precisionEffectScale));
        return base.times(tacticsCostMultiplier).times(statusesCostMultiplier)
            .times(attributeMultiplier).ceil();
    }

    get incomingAttackDowngradeCost() {
        const base = Decimal(getConfigurationValue("base_attack_downgrade_cost"));
        const tacticsCostMultiplier = Tactics[this.character.tactics].modifiers.attack_downgrade_cost_multiplier || 1;
        const statusesCostMultiplier = Object.keys(this.character.statuses).reduce((total, next) => {
            return total.plus(Statuses[next].attack_downgrade_cost_multiplier || 0);
        }, Decimal(1));
        const evasionEffectScale = getConfigurationValue("mechanics.combat.evasion.effectPerPoint");
        const attributeMultiplier = Decimal(1).minus(this.evasion.times(evasionEffectScale));
        return base.times(tacticsCostMultiplier).times(statusesCostMultiplier)
            .times(attributeMultiplier).ceil();
    }
}

export function calculateCombatStat(character, combatAttribute) {
    const attributeBase = character.attributes[getConfigurationValue(["mechanics", "combat", combatAttribute, "baseAttribute"])];
    const tacticsModifier = Decimal(0).plus(Tactics[character.tactics].modifiers[`${combatAttribute}_modifier`] || 0);
    const statusesModifier = Object.keys(character.statuses).reduce((currentValue, nextStatus) => {
        const statusDefinition = Statuses[nextStatus];
        return currentValue.plus(_.get(statusDefinition, ["effects", `${combatAttribute}_modifier`, "modifier"], 0));
    }, Decimal(0));
    const traitModifier = Object.keys(character.traits).reduce((previousValue, trait) => {
        const traitDefinition = Traits[trait];
        if (_.get(traitDefinition, ["continuous", "trigger_effects", `${combatAttribute}_modifier`, "target"]) === "self") {
            return previousValue.plus(evaluateExpression(_.get(traitDefinition, ["continuous", "trigger_effects", `${combatAttribute}_modifier`, "modifier"]), {
                tier: Decimal(character.traits[trait])
            }));
        }
        return previousValue;
    }, Decimal(0));
    return attributeBase.times(tacticsModifier.plus(statusesModifier).plus(traitModifier).plus(1));
}

export function assertHasProperty(propertyName, object) {
    if (object[propertyName] === undefined &&
        object[`_${propertyName}`] === undefined) {
        throw new Error(`Missing required property ${propertyName} or _${propertyName}`);
    }
}

const characterPropsSchema = JOI.object({
    id: JOI.number().required(),
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
    tactics: JOI.string().valid(...Object.keys(Tactics)).required(),
    combat: JOI.object({
        stamina: JOI.alternatives().try(JOI.string(), JOI.object().instance(Decimal)),
        precisionPoints: JOI.alternatives().try(JOI.string(), JOI.number(), JOI.object().instance(Decimal)),
        evasionPoints: JOI.alternatives().try(JOI.string(), JOI.number(), JOI.object().instance(Decimal)),
    }).default({}),
    adjectives: JOI.array().items(JOI.object()),
    absorbedPower: JOI.alternatives().try(JOI.string(), JOI.object().instance(Decimal), JOI.number())
        .default(Decimal(0)),
    hp: JOI.alternatives().try(JOI.string(), JOI.number(), JOI.object().instance(Decimal)),
    party: JOI.number(),
    latentPower: JOI.alternatives().try(JOI.string(), JOI.object().instance(Decimal)),
    enabled: JOI.boolean(),
    texture: JOI.string(),
    description: JOI.string(),
    isRival: JOI.boolean()
});

const newTraitsSchema = JOI.object().pattern(JOI.string(), JOI.boolean());