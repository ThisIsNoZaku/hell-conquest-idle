import {getConfigurationValue} from "./config";
import {getGlobalState} from "./engine";
import {Creatures} from "./data/creatures";
import {Decimal} from "decimal.js";
import {Tactics} from "./data/Tactics";
import {Statuses} from "./data/Statuses";
import * as _ from "lodash";
import {Traits} from "./data/Traits";
import getPowerNeededForLevel from "./engine/general/getPowerNeededForLevel";
import getLevelForPower from "./engine/general/getLevelForPower";
import evaluateExpression from "./engine/general/evaluateExpression";
import {HitTypes} from "./data/HitTypes";
import * as JOI from "joi";

export class Character {
    constructor(props) {
        const validation = characterPropsSchema.validate(props);
        if(validation.error) {
            throw new Error(`Character failed validation: ${validation.error}`);
        }
        assertHasProperty("id", props);
        assertHasProperty("attributes", props);
        assertHasProperty("traits", props);
        assertHasProperty("tactics", props);
        assertHasProperty("powerLevel", props);
        this._tactics = props.tactics || props._tactics;
        this._statuses = props.statuses || props._statuses || {};
        this.adjectives = props.adjectives;
        this.powerLevel = Decimal(props.powerLevel);
        this._isPc = props.isPc || props._isPc;
        this.id = props.id;
        this._name = props.name || props._name;
        this._traits = Object.keys(props.traits || props._traits).reduce((transformed, next) => {
            transformed[next] = Decimal((props.traits || props._traits)[next]);
            return transformed;
        }, {});
        this._absorbedPower = Decimal(props.absorbedPower || props._absorbedPower || 0);
        this._latentPower = Decimal(props.latentPower || props._latentPower || 0);
        this._stolenPower = props.stolenPower || props._stolenPower || 0;
        this._attributes = new Attributes(props.attributes || props._attributes, this);
        this.highestLevelReached = props.highestLevelReached;
        this._currentHp = Decimal(props._currentHp || this.maximumHp);
        this._combat = new CombatStats(this);
        this._appearance = props.appearance || props._appearance;
        this._modifiers = props.modifiers || props._modifiers || [];
    }

    levelUp(){
        this.powerLevel = this.powerLevel.plus(1);
        this._absorbedPower = this.absorbedPower.minus(getPowerNeededForLevel(this.powerLevel));
    }

    get tactics() {
        return this._tactics;
    }

    get statuses() {
        return this._statuses;
    }

    clearStatuses() {
        Object.keys(this._statuses).forEach(status => delete this._statuses[status]);
    }

    set tactics(newTactics) {
        this._tactics = newTactics;
    }

    get isPc() {
        return this._isPc;
    }

    get name() {
        return this._name;
    }

    get hp() {
        return Decimal(this._currentHp);
    }

    set hp(newHealth) {
        if (this.maximumHp.lt(newHealth)) {
            this._currentHp = this.maximumHp;
        } else {
            this._currentHp = newHealth;
        }
    }

    get isAlive() {
        return Decimal(this.hp).gt(0);
    }

    get latentPower() {
        return this._latentPower;
    }

    get latentPowerModifier() {
        return this._latentPower.times(getConfigurationValue("latent_power_effect_scale")).plus(1);
    }

    set latentPower(newLatentPower) {
        this._latentPower = newLatentPower;
    }

    get maximumHp() {
        const base = Decimal(getConfigurationValue("mechanics.combat.hp.baseHp"));
        const fromLevel = this.powerLevel.times(getConfigurationValue("mechanics.combat.hp.pointsPerLevel"));
        const attributeMultiplier = this.attributes[getConfigurationValue("mechanics.combat.hp.baseAttribute")]
            .times(getConfigurationValue("mechanics.combat.hp.effectPerPoint")).plus(1);

        return base.plus(fromLevel)
            .plus(this._isPc ? getConfigurationValue("mechanics.combat.hp.pcBonus") : 0)
            .times(attributeMultiplier)
            .floor();
    }

    get attributes() {
        return this._attributes;
    }

    get combat() {
        return this._combat;
    }

    get traits() {
        return this._traits;
    }

    set traits(newTraits) {
        this._traits = newTraits;
    }

    get appearance() {
        return this._appearance;
    }

    reincarnate(newAppearance, newTraits) {
        this._appearance = newAppearance;
        this._traits = newTraits;
        this._currentHp = this.maximumHp;
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
        this.absorbedPower = Decimal.min(getPowerNeededForLevel(this.powerLevel.plus(1)), this.absorbedPower.plus(powerGained));
        return powerGained;
    }

    get healing() {
        const baseHealing = Decimal(this.powerLevel.times(getConfigurationValue("mechanics.combat.hp.healingPerLevel")));
        const tacticsMultiplier = Decimal(1).plus(Tactics[this.tactics].modifiers.healing_modifier || 0);
        return baseHealing.times(tacticsMultiplier);
    }

    get absorbedPower() {
        return this._absorbedPower;
    }

    set absorbedPower(value) {
        this._absorbedPower = value;
        if (getLevelForPower(this._absorbedPower).gt(getConfigurationValue("mechanics.maxLevel"))) {
            this._absorbedPower = getPowerNeededForLevel(getConfigurationValue("mechanics.maxLevel"));
        }
        if (this.appearance && this._isPc) {
            Creatures[this.appearance].traits.forEach(trait => {
                this._traits[trait] = getLevelForPower(this._absorbedPower).plus(1).div(10).ceil();
                getGlobalState().unlockedTraits[trait] = this._traits[trait];
            });
        }
    }

    get speed() {
        return Decimal(100);
    }

    get modifiers() {
        return this._modifiers;
    }

    get stolenPower() {
        return Decimal(this._stolenPower);
    }

    set stolenPower(newValue) {
        this._stolenPower = newValue;
    }

    get stolenPowerModifier() {
        return Decimal.min(1, this.stolenPower.div(this.powerLevel));
    }

    refreshBeforeCombat() {
        this.combat.evasionPoints = this.combat.maxPrecisionPoints;
        this.combat.precisionPoints = this.combat.maxPrecisionPoints;
    }
}

export class Attributes {
    constructor(attributes, character) {
        this._brutality = attributes.brutality || attributes._brutality || 0;
        this._cunning = attributes.cunning || attributes._cunning || 0;
        this._deceit = attributes.deceit || attributes._deceit || 0;
        this._madness = attributes.madness || attributes._madness || 0;
        Object.defineProperty(this, "character", {
            value: character
        })
    }

    get baseBrutality() {
        return Decimal(this._brutality).floor();
    }
    
    set baseBrutality(newValue) {
        this._brutality = newValue;
    }

    get baseCunning() {
        return Decimal(this._cunning).floor();
    }

    set baseCunning(newValue) {
        this._cunning = newValue;
    }

    get baseDeceit() {
        return Decimal(this._deceit).floor();
    }

    set baseDeceit(newValue) {
        this._deceit = newValue;
    }

    get baseMadness() {
        return Decimal(this._madness).floor();
    }

    set baseMadness(newValue) {
        this._madness = newValue;
    }

    get brutality() {
        return evaluateExpression(getConfigurationValue("mechanics.combat.effectiveAttributeCalculation"), {
            baseAttribute: this.baseBrutality,
            stolenPowerModifier: this.character.latentPowerModifier
        }).floor();
    }

    get cunning() {
        return evaluateExpression(getConfigurationValue("mechanics.combat.effectiveAttributeCalculation"), {
            baseAttribute: this.baseCunning,
            stolenPowerModifier: this.character.latentPowerModifier
        }).floor();
    }

    get deceit() {
        return evaluateExpression(getConfigurationValue("mechanics.combat.effectiveAttributeCalculation"), {
            baseAttribute: this.baseDeceit,
            stolenPowerModifier: this.character.latentPowerModifier
        }).floor();
    }

    get madness() {
        return evaluateExpression(getConfigurationValue("mechanics.combat.effectiveAttributeCalculation"), {
            baseAttribute: this.baseMadness,
            stolenPowerModifier: this.character.latentPowerModifier
        }).floor();
    }
}

class CombatStats {
    constructor(character) {
        Object.defineProperty(this, "character", {
            value: character
        });
        this._precisionPoints = this.maxPrecisionPoints;
        this._evasionPoints = this.maxEvasionPoints;
        this.stamina = this.maximumStamina;
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
            const modifier = Decimal(Statuses[currentValue].effects.received_damage_modifier).pow(this.character.statuses[currentValue]).minus(1);
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
        return this.character.powerLevel.times(2).plus(1);
    }

    get power() {
        return calculateCombatStat(this.character, "power");
    }

    get maxPrecisionPoints() {
        return Decimal(this.character.attributes[getConfigurationValue("mechanics.combat.precision.baseAttribute")])
            .times(getConfigurationValue("mechanics.combat.precision.effectPerPoint"));
    }

    get maxEvasionPoints() {
        return Decimal(this.character.attributes[getConfigurationValue("mechanics.combat.evasion.baseAttribute")])
            .times(getConfigurationValue("mechanics.combat.evasion.effectPerPoint"));
    }

    get precisionPoints() {
        return Decimal(this._precisionPoints);
    }

    get evasionPoints() {
        return Decimal(this._evasionPoints);
    }

    set precisionPoints(newValue) {
        this._precisionPoints = newValue;
    }

    set evasionPoints(newValue) {
        this._evasionPoints = newValue;
    }
}

function calculateDamage(character) {
    const baseDamage = evaluateExpression(getConfigurationValue("mechanics.combat.baseDamage"), {
        player: character
    });
    return baseDamage.ceil();
}

export function calculateCombatStat(character, combatAttribute) {
    const attributeBase = character.attributes[getConfigurationValue("mechanics.combat")[combatAttribute].baseAttribute];
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
    id: JOI.number(),
    attributes: JOI.alternatives().try(
        JOI.object({
            baseBrutality: JOI.alternatives().try(JOI.number(), JOI.string(), JOI.object()),
            baseCunning: JOI.alternatives().try(JOI.number(), JOI.string(), JOI.object()),
            baseDeceit: JOI.alternatives().try(JOI.number(), JOI.string(), JOI.object()),
            baseMadness: JOI.alternatives().try(JOI.number(), JOI.string(), JOI.object()),
        }),
        JOI.object({
            _baseBrutality: JOI.alternatives().try(JOI.number(), JOI.string(), JOI.object()),
            _baseCunning: JOI.alternatives().try(JOI.number(), JOI.string(), JOI.object()),
            _baseDeceit: JOI.alternatives().try(JOI.number(), JOI.string(), JOI.object()),
            _baseMadness: JOI.alternatives().try(JOI.number(), JOI.string(), JOI.object()),
        })
    )
}).unknown(true);