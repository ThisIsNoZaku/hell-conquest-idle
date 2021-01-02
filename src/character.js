import {config} from "./config";
import {evaluateExpression, getGlobalState, getLevelForPower, getPowerNeededForLevel} from "./engine";
import {Creatures} from "./data/creatures";
import {Decimal} from "decimal.js";
import {Tactics} from "./data/Tactics";
import {Statuses} from "./data/Statuses";

export class Character {
    constructor(props) {

        this._isPc = props.isPc || props._isPc;
        this.id = props.id;
        this._name = props.name || props._name;
        this._absorbedPower = Decimal(props.absorbedPower || props._absorbedPower || 0);
        this._latentPower = Decimal(props.latentPower || props._latentPower || 0);
        this._attributes = new Attributes(props.attributes || props._attributes, this);
        this._currentHp = Decimal(props._currentHp || this.maximumHp);
        this._combat = new CombatStats(props.combat || props._combat, this);
        this._traits = Object.keys(props.traits || props._traits).reduce((transformed, next) => {
            transformed[next] = Decimal((props.traits || props._traits)[next]);
            return transformed;
        }, {});
        this._appearance = props.appearance || props._appearance;
        this._modifiers = props.modifiers || props._modifiers || [];
        this._tactics = props.tactics || props._tactics || "defensive";
        this._statuses = props.statuses || props._statuses || {};
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

    get powerLevel() {
        return getLevelForPower(this._absorbedPower);
    }

    get currentHp() {
        return Decimal(this._currentHp);
    }

    set currentHp(newHealth) {
        if (this.maximumHp.lt(newHealth)) {
            this._currentHp = this.maximumHp;
        } else {
            this._currentHp = newHealth;
        }
    }

    get isAlive() {
        return Decimal(this.currentHp).gt(0);
    }

    get latentPower() {
        return this._latentPower;
    }

    set latentPower(newLatentPower) {
        this._latentPower = newLatentPower;
    }

    get maximumHp() {
        const attributeMultiplier = this.attributes.madness.times(config.mechanics.combat.hp.effectPerPoint);
        const latentPowerMultiplier = this.latentPower.times(config.mechanics.reincarnation.latentPowerEffectScale);
        return this.powerLevel
            .times(attributeMultiplier.plus(latentPowerMultiplier).plus(1))
            .mul(config.mechanics.combat.hp.pointsPerLevel)
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
    }

    otherDemonIsGreaterDemon(other) {
        const greaterDemonScale = evaluateExpression(config.encounters.greaterLevelScale, {
            player: this,
            enemy: other
        });
        return other.powerLevel.gte(this.powerLevel.plus(greaterDemonScale));
    }

    otherDemonIsLesserDemon(other) {
        const lesserDemonScale = evaluateExpression(config.encounters.lesserLevelScale, {
            player: this,
            enemy: other
        });
        return other.powerLevel.lte(this.powerLevel.minus(lesserDemonScale));
    }

    gainPower(powerGained) {
        const latentPowerMultiplier = this.latentPower.times(config.mechanics.reincarnation.latentPowerEffectScale)
            .plus(1);
        powerGained = powerGained.times(latentPowerMultiplier).floor();
        this.absorbedPower = this.absorbedPower.plus(powerGained);
        return powerGained;
    }

    get healing() {
        const baseHealing = Decimal(this.powerLevel.times(config.mechanics.combat.hp.healingPerLevel));
        const tacticsMultiplier = Decimal(1).plus(Tactics[this.tactics].modifiers.healing_modifier || 0);
        return baseHealing.times(tacticsMultiplier);
    }

    get absorbedPower() {
        return this._absorbedPower;
    }

    set absorbedPower(value) {
        this._absorbedPower = value;
        if (getLevelForPower(this._absorbedPower).gt(config.mechanics.maxLevel)) {
            this._absorbedPower = getPowerNeededForLevel(config.mechanics.maxLevel);
        }
        if (this.appearance) {
            Creatures[this.appearance].traits.forEach(trait => {
                this._traits[trait] = getLevelForPower(this._absorbedPower).div(10).ceil();
                getGlobalState().unlockedTraits[trait] = getLevelForPower(this._absorbedPower).div(10).ceil();
            });
        }
    }

    get speed() {
        return Decimal(100);
    }

    addModifier(modifier) {
        this._modifiers.push(modifier);
    }

    get modifiers() {
        return this._modifiers;
    }
}

export class Attributes {
    constructor(attributes, character) {
        this._brutality = attributes.brutality || attributes._brutality || 0;
        this._cunning = attributes.cunning || attributes._cunning || 0;
        this._deceit = attributes.deceit || attributes._deceit || 0;
        this._madness = attributes.madness || attributes._madness || 0;
        Object.defineProperty(this, "character", {
            value: () => character
        })
    }

    get brutality() {
        const latentPowerMultiplier = this.character().latentPower.times(config.mechanics.reincarnation.latentPowerEffectScale)
            .plus(1);
        return Decimal(this._brutality).times(latentPowerMultiplier).floor();
    }

    get cunning() {
        const latentPowerMultiplier = this.character().latentPower.times(config.mechanics.reincarnation.latentPowerEffectScale)
            .plus(1);
        return Decimal(this._cunning).times(latentPowerMultiplier).floor();
    }

    get deceit() {
        const latentPowerMultiplier = this.character().latentPower.times(config.mechanics.reincarnation.latentPowerEffectScale)
            .plus(1);
        return Decimal(this._deceit).times(latentPowerMultiplier).floor();
    }

    get madness() {
        const latentPowerMultiplier = this.character().latentPower.times(config.mechanics.reincarnation.latentPowerEffectScale)
            .plus(1);
        return Decimal(this._madness).times(latentPowerMultiplier).floor();
    }
}

class CombatStats {
    constructor(props, character) {
        this.character = function () {
            return character;
        }
    }

    get minimumDamage() {
        return calculateDamage(config.mechanics.combat.defaultMinimumDamageMultiplier, this.character()).floor();
    }

    get medianDamage() {
        return calculateDamage(config.mechanics.combat.defaultMedianDamageMultiplier, this.character()).floor();
    }

    get maximumDamage() {
        const tacticsMultiplier = Decimal(1).plus(
            Tactics[this.character().tactics].modifiers.critical_hit_damage_modifier || 0
        )
        return calculateDamage(Decimal(config.mechanics.combat.defaultMaximumDamageMultiplier), this.character())
            .times(tacticsMultiplier).floor();
    }

    get evasion() {
        const attributeBase = this.character().attributes[config.mechanics.combat.evasion.baseAttribute];
        const tacticsModifier = Decimal(1).plus(Tactics[this.character().tactics].evasion_modifier || 0);
        const statusesModifier = Object.keys(this.character().statuses).reduce((currentValue, nextStatus) => {
            const statusDefinition = Statuses[nextStatus];
            return currentValue.plus(statusDefinition.effects.evasion_multiplier || 0).minus(1);
        }, Decimal(1));
        return attributeBase.times(tacticsModifier.plus(statusesModifier));
    }

    get precision() {
        const attributeBase = this.character().attributes[config.mechanics.combat.precision.baseAttribute];
        const tacticsModifier = Decimal(1).plus(Tactics[this.character().tactics].precison_modifier || 0);
        const statusesModifier = Object.keys(this.character().statuses).reduce((currentValue, nextStatus) => {
            const statusDefinition = Statuses[nextStatus];
            return currentValue.plus(statusDefinition.effects.precision_multiplier || 0).minus(1);
        }, Decimal(1));
        return attributeBase.times(tacticsModifier.plus(statusesModifier));
    }

    get resilience() {
        const attributeBase = this.character().attributes[config.mechanics.combat.resilience.baseAttribute];
        const tacticsModifier = Decimal(1).plus(Tactics[this.character().tactics].resilience_modifier || 0);
        const statusesModifier = Object.keys(this.character().statuses).reduce((currentValue, nextStatus) => {
            const statusDefinition = Statuses[nextStatus];
            return currentValue.plus(statusDefinition.effects.resilience_multiplier || 0).minus(1);
        }, Decimal(1));
        return attributeBase.times(tacticsModifier.plus(statusesModifier));
    }

    get power() {
        const attributeBase = this.character().attributes[config.mechanics.combat.power.baseAttribute];
        const tacticsModifier = Decimal(1).plus(Tactics[this.character().tactics].power_modifier || 0);
        const statusesModifier = Object.keys(this.character().statuses).reduce((currentValue, nextStatus) => {
            const statusDefinition = Statuses[nextStatus];
            return currentValue.plus(statusDefinition.effects.power_multiplier || 0).minus(1);
        }, Decimal(1));
        return attributeBase.times(tacticsModifier.plus(statusesModifier));
    }

}

function calculateDamage(hitTypeDamageMultiplier, character) {
    const baseDamage = evaluateExpression(config.mechanics.combat.baseDamage, {
        player: character
    });
    const multiplierFromPower = character.combat.power.div(100).plus(1);
    return baseDamage
        .times(hitTypeDamageMultiplier)
        .times(multiplierFromPower).ceil();
}