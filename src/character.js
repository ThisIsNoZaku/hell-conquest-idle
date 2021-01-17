import {getConfigurationValue} from "./config";
import {getCharacter, getGlobalState} from "./engine";
import {Creatures} from "./data/creatures";
import {Decimal} from "decimal.js";
import {Tactics} from "./data/Tactics";
import {Statuses} from "./data/Statuses";
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
        if(validation.error) {
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
        this.combat = new CombatStats(this, props.combat);
        this.appearance = props.appearance || props._appearance;

        this.hp = Decimal(props.hp !== undefined ? props.hp : this.maximumHp);
    }

    levelUp(){
        this.powerLevel = this.powerLevel.plus(1);
        this.absorbedPower = this.absorbedPower.minus(getPowerNeededForLevel(this.powerLevel));
        Creatures[this.appearance].traits.forEach(trait =>{
            getGlobalState().unlockedTraits[trait] = this.powerLevel.div(10).ceil();
        });
    }

    clearStatuses() {
        Object.keys(this.statuses).forEach(status => delete this.statuses[status]);
    }

    getStatusStacks(status) {
        const statusInstances = this.statuses[status];
        return statusInstances.reduce((highestRank, nextInstance) => {
            return Decimal.max(highestRank, nextInstance.stacks);
        }, 0)
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

    get latentPowerModifier() {
        return this.latentPower.times(getConfigurationValue("latent_power_effect_scale")).plus(1);
    }

    get maximumHp() {
        const base = Decimal(getConfigurationValue("mechanics.combat.hp.baseHp"));
        const fromLevel = this.powerLevel.times(getConfigurationValue("mechanics.combat.hp.pointsPerLevel"));
        const attributeMultiplier = this.attributes[getConfigurationValue("mechanics.combat.hp.baseAttribute")]
            .times(getConfigurationValue("mechanics.combat.hp.effectPerPoint")).plus(1);

        return base.plus(fromLevel)
            .plus(this.isPc ? getConfigurationValue("mechanics.combat.hp.pcBonus") : 0)
            .times(attributeMultiplier)
            .floor();
    }

    reincarnate(newAppearance, newTraits) {
        this.appearance = newAppearance;
        this.traits = Object.keys(newTraits).reduce((previousValue, currentValue) => {
            previousValue[currentValue] = getGlobalState().unlockedTraits[currentValue];
            return previousValue;
        }, {});
        Creatures[newAppearance].traits.forEach(trait => {
            this.traits[trait] = Math.max(1, this.traits[trait] || 0);
        });
        this.absorbedPower = Decimal(0);
        this.powerLevel = Decimal(1);
        this.reset();
    }

    reset() {
        this.hp = this.maximumHp;
        this.statuses = {};
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
        const latentPowerMultiplier = this.latentPowerModifier;
        powerGained = powerGained.times(latentPowerMultiplier).floor();
        this.absorbedPower = this.absorbedPower.plus(powerGained);
        return powerGained;
    }

    get healing() {
        const healingPercentage = getConfigurationValue("recovery_action_healing_percentage");
        return Decimal(healingPercentage).times(this.maximumHp).ceil();
    }

    refreshBeforeCombat() {
        this.combat.evasionPoints = this.combat.maxEvasionPoints;
        this.combat.precisionPoints = this.combat.maxPrecisionPoints;
        if(this.combat.maxEvasionPoints.lt(this.combat.evasionPoints)) {
            throw new Error("Max evasion points < evasion points");
        }
        if(this.combat.maxPrecisionPoints.lt(this.combat.precisionPoints)) {
            throw new Error("Max precision points < precision points");
        }
        this.statuses = {};
    }
}

export class Attributes {
    constructor(attributes, character) {
        Object.defineProperty(this, "character", {
            value: character
        });
        this.baseBrutality = Decimal(attributes.baseBrutality || getConfigurationValue("minimum_attribute_score"));
        this.baseCunning = Decimal(attributes.baseCunning  || getConfigurationValue("minimum_attribute_score"));
        this.baseDeceit = Decimal(attributes.baseDeceit  || getConfigurationValue("minimum_attribute_score"));
        this.baseMadness = Decimal(attributes.baseMadness  || getConfigurationValue("minimum_attribute_score"));
    }

    get brutality() {
        return evaluateExpression(getConfigurationValue("mechanics.combat.effectiveAttributeCalculation"), {
            baseAttribute: this.baseBrutality,
            stolenPowerModifier: Decimal(this.character.latentPowerModifier)
        }).floor();
    }

    get cunning() {
        return evaluateExpression(getConfigurationValue("mechanics.combat.effectiveAttributeCalculation"), {
            baseAttribute: this.baseCunning,
            stolenPowerModifier: Decimal(this.character.latentPowerModifier)
        }).floor();
    }

    get deceit() {
        return evaluateExpression(getConfigurationValue("mechanics.combat.effectiveAttributeCalculation"), {
            baseAttribute: this.baseDeceit,
            stolenPowerModifier: Decimal(this.character.latentPowerModifier)
        }).floor();
    }

    get madness() {
        return evaluateExpression(getConfigurationValue("mechanics.combat.effectiveAttributeCalculation"), {
            baseAttribute: this.baseMadness,
            stolenPowerModifier: Decimal(this.character.latentPowerModifier)
        }).floor();
    }
}

class CombatStats {
    constructor(character, overrides) {
        Object.defineProperty(this, "character", {
            value: character
        });
        this.precisionPoints = Decimal(overrides.precisionPoints === undefined ? this.maxPrecisionPoints : overrides.precisionPoints );
        this.evasionPoints = Decimal(overrides.evasionPoints === undefined ? this.maxEvasionPoints : overrides.evasionPoints );
        this.stamina = Decimal(overrides.stamina || this.maximumStamina);
    }

    refresh() {
        this.precisionPoints = this.maxPrecisionPoints;
        this.evasionPoints = this.maxEvasionPoints;
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
            const statusModifier = Statuses[currentValue].effects.received_damage_modifier || 0;
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
        return calculateCharacterStamina(this.character.powerLevel);
    }

    get power() {
        return calculateCombatStat(this.character, "power");
    }

    get maxPrecisionPoints() {
        const attributeToUse = this.precision;
        const scale = getConfigurationValue("mechanics.combat.precision.effectPerPoint");
        return attributeToUse
            .times(scale);
    }

    get maxEvasionPoints() {
        const attributeToUse = this.evasion;
        const scale = getConfigurationValue("mechanics.combat.evasion.effectPerPoint");
        return attributeToUse
            .times(scale);
    }

    get attackUpgradeCost() {
        const base = Decimal(getConfigurationValue("base_attack_upgrade_cost"));
        const tacticsCostMultiplier = Tactics[this.character.tactics].modifiers.attack_upgrade_cost_multiplier || 1;
        const statusesCostMultiplier = Object.keys(this.character.statuses).reduce((total, next)=>{
            return total.plus(Statuses[next].attack_upgrade_cost_multiplier || 0);
        }, Decimal(1));
        return base.times(tacticsCostMultiplier).times(statusesCostMultiplier);
    }

    get incomingAttackDowngradeCost() {
        const base = Decimal(getConfigurationValue("base_attack_downgrade_cost"));
        const tacticsCostMultiplier = Tactics[this.character.tactics].modifiers.attack_downgrade_cost_multiplier || 1;
        const statusesCostMultiplier = Object.keys(this.character.statuses).reduce((total, next)=>{
            return total.plus(Statuses[next].attack_downgrade_cost_multiplier || 0);
        }, Decimal(1));
        return base.times(tacticsCostMultiplier).times(statusesCostMultiplier);
    }
}

export function calculateCombatStat(character, combatAttribute) {
    const attributeBase = character.attributes[getConfigurationValue(["mechanics", "combat", combatAttribute, "baseAttribute"])];
    const tacticsModifier = Decimal(0).plus(Tactics[character.tactics].modifiers[`${combatAttribute}_modifier`] || 0);
    const statusesModifier = Object.keys(character.statuses).reduce((currentValue, nextStatus) => {
        const statusDefinition = Statuses[nextStatus];
        return currentValue.plus(statusDefinition.effects[`${combatAttribute}_modifier`] || 0);
    }, Decimal(0));
    const traitModifier = Object.keys(character.traits).reduce((previousValue, trait) => {
        const traitDefinition = Traits[trait];
        if(_.get(traitDefinition, ["continuous", "trigger_effects", `${combatAttribute}_modifier`, "target"]) === "self") {
            return previousValue.plus(evaluateExpression(_.get(traitDefinition, ["continuous", "trigger_effects", `${combatAttribute}_modifier`, "modifier"]), {
                rank: Decimal(character.traits[trait])
            }));
        }
        return previousValue;
    }, Decimal(0));
    return attributeBase.times(tacticsModifier.plus(statusesModifier).plus(traitModifier).plus(1));
}

export function assertHasProperty(propertyName, object) {
    if(object[propertyName] === undefined &&
        object[`_${propertyName}`] === undefined){
        throw new Error(`Missing required property ${propertyName} or _${propertyName}`);
    };
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