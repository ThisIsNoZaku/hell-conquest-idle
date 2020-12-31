import {config} from "./config";
import {evaluateExpression, getLevelForPower, getPowerNeededForLevel} from "./engine";
import {Creatures} from "./data/creatures";
import {Decimal} from "decimal.js";

export class Character {
    constructor(props) {
        this._isPc = props.isPc || props._isPc;
        this.id = props.id;
        this._name = props.name || props._name;
        this._absorbedPower = Decimal(props.absorbedPower || props._absorbedPower || 0);
        this._latentPower = Decimal(props.latentPower || props._latentPower || 0);
        this._currentHp = Decimal(props._currentHp || this.maximumHp);
        this._attributes = new Attributes(props.attributes || props._attributes, this);
        this._combat = new CombatStats(props.combat || props._combat, this);
        this._traits = Object.keys(props.traits || props._traits).reduce((transformed, next) => {
            transformed[next] = Decimal((props.traits || props._traits)[next]);
            return transformed;
        }, {});
        this._appearance = props.appearance || props._appearance;
        this._modifiers = props.modifiers || props._modifiers || [];
    }

    get isPc(){
        return this._isPc;
    }

    get name() {
        return this._name;
    }

    get powerLevel() {
        return getLevelForPower(this._absorbedPower);
    }

    get currentHp() {
        return this._currentHp;
    }

    set currentHp(newHealth) {
        if(this.maximumHp.lt(newHealth)) {
            this._currentHp = this.maximumHp;
        } else {
            this._currentHp = newHealth;
        }
    }

    get alive() {
        return this.currentHp > 0;
    }

    get latentPower() {
        return this._latentPower;
    }

    set latentPower(newLatentPower) {
        this._latentPower = newLatentPower;
    }

    get maximumHp() {
        return this.powerLevel
            .mul(this.latentPower.div(100).plus(1))
            .mul(config.mechanics.hp.pointsPerLevel)
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
        powerGained = powerGained.times(this.latentPower.div(100).plus(1)).floor();
        this._absorbedPower = this._absorbedPower.plus(powerGained);
        if(getLevelForPower(this._absorbedPower).gt(config.mechanics.maxLevel)) {
            this._absorbedPower = getPowerNeededForLevel(config.mechanics.maxLevel);
        }
        Creatures[this.appearance].traits.forEach(trait => {
            this._traits[trait] = getLevelForPower(this._absorbedPower);
        });
        return powerGained;
    }

    get healing() {
        return Decimal(this.powerLevel.times(config.mechanics.hp.healingPerLevel));
    }

    get absorbedPower() {
        return this._absorbedPower;
    }

    set absorbedPower(value){
        this._absorbedPower = value;
        if(getLevelForPower(this._absorbedPower).gt(config.mechanics.maxLevel)) {
            this._absorbedPower = getPowerNeededForLevel(config.mechanics.maxLevel);
        }
        if(this.appearance) {
            Creatures[this.appearance].traits.forEach(trait => {
                this._traits[trait] = getLevelForPower(this._absorbedPower);
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

class Attributes {
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
        const latentPowerMultiplier = this.character().latentPower.div(100).plus(1);
        return this._brutality.times(latentPowerMultiplier).floor();
    }

    get cunning() {
        const latentPowerMultiplier = this.character().latentPower.div(100).plus(1);
        return this._cunning.times(latentPowerMultiplier).floor();
    }

    get deceit() {
        const latentPowerMultiplier = this.character().latentPower.div(100).plus(1);
        return this._deceit.times(latentPowerMultiplier).floor();
    }

    get madness() {
        const latentPowerMultiplier = this.character().latentPower.div(100).plus(1);
        return this._madness.times(latentPowerMultiplier).floor();
    }
}

class CombatStats {
    constructor(props, character) {
        this.character = function() {
            return character;
        }
        this.fatigue = 0;
    }

    get minimumDamageWeight() {
        return Decimal(config.combat.baseMinimumDamageWeight);
    }

    get medianDamageWeight() {
        return Decimal(config.combat.baseMedianDamageWeight);
    }

    get maximumDamageWeight() {
        return Decimal(config.combat.baseMaximumDamageWeight);
    }

    get minimumDamage() {
        const characterPowerLevel = this.character().powerLevel.times(this.character().latentPower.div(100).plus(1));
        const minimumDamageMultiplier = config.combat.defaultMinimumDamageMultiplier;
        const attributeModifier = this.character().attributes.brutality * config.combat.attributeDamageModifier;
        return characterPowerLevel
            .times(config.mechanics.attackDamage.pointsPerLevel)
            .times(minimumDamageMultiplier)
            .times(1 + attributeModifier).ceil();
    }

    get medianDamage() {
        const characterPowerLevel = this.character().powerLevel.times(this.character().latentPower.div(100).plus(1));
        const minimumDamageMultiplier = config.combat.defaultMedianDamageMultiplier;
        const attributeModifier = this.character().attributes.brutality * config.combat.attributeDamageModifier;
        return characterPowerLevel
            .times(config.mechanics.attackDamage.pointsPerLevel)
            .times(minimumDamageMultiplier)
            .times(1 + attributeModifier).ceil();
    }

    get maximumDamage() {
        const characterPowerLevel = this.character().powerLevel.times(this.character().latentPower.div(100).plus(1));
        const minimumDamageMultiplier = config.combat.defaultMaximumDamageMultiplier;
        const attributeModifier = this.character().attributes.brutality * config.combat.attributeDamageModifier;
        return characterPowerLevel
            .times(config.mechanics.attackDamage.pointsPerLevel)
            .times(minimumDamageMultiplier)
            .times(1 + attributeModifier).ceil();
    }

    get canAct() {
        return true;
    }
}