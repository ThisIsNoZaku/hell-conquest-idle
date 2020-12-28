import {config} from "./config";
import {Big} from "big.js";
import {getLevelForPower} from "./engine";
import {Creatures} from "./data/creatures";

export class Character {
    constructor(props) {
        this._isPc = props.isPc || props._isPc;
        this.id = props.id;
        this._name = props.name || props._name;
        this._absorbedPower = Big(props.absorbedPower || props._absorbedPower || 0);
        this._currentHp = Big(props._currentHp || this.maximumHp);
        this._attributes = new Attributes(props.attributes || props._attributes);
        this._combat = new CombatStats(props.combat || props._combat, this);
        this._traits = Object.keys(props.traits || props._traits).reduce((transformed, next) => {
            transformed[next] = Big((props.traits || props._traits)[next]);
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
        this._currentHp = newHealth;
    }

    get alive() {
        return this.currentHp > 0;
    }

    get maximumHp() {
        return this.powerLevel.mul(5).plus(this._isPc ? 5 : 0);
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

    get appearance() {
        return this._appearance;
    }

    reincarnate(newAppearance, newTraits) {
        this._appearance = newAppearance;
        this._traits = newTraits;
    }

    otherDemonIsGreaterDemon(other) {
        return other.powerLevel.gte(this.powerLevel.plus(config.encounters.greaterLevelScale));
    }

    otherDemonIsLesserDemon(other) {
        return other.powerLevel.lte(this.powerLevel.minus(config.encounters.lesserLevelScale));
    }

    gainPower(powerGained) {
        this._absorbedPower = this._absorbedPower.plus(powerGained);
        Creatures[this.appearance].traits.forEach(trait => {
            this._traits[trait] = getLevelForPower(this._absorbedPower);
        });
    }

    get healing() {
        return Big(1);
    }

    get absorbedPower() {
        return this._absorbedPower;
    }

    set absorbedPower(value){
        this._absorbedPower = value;
    }

    get speed() {
        return Big(100);
    }

    addModifier(modifier) {
        this._modifiers.push(modifier);
    }

    get modifiers() {
        return this._modifiers;
    }
}

class Attributes {
    constructor(attributes) {
        this._brutality = attributes.brutality || attributes._brutality || 0;
        this._cunning = attributes.cunning || attributes._cunning || 0;
        this._deceit = attributes.deceit || attributes._deceit || 0;
        this._madness = attributes.madness || attributes._madness || 0;
    }

    get brutality() {
        return this._brutality;
    }

    get cunning() {
        return this._cunning;
    }

    get deceit() {
        return this._deceit;
    }

    get madness() {
        return this._madness;
    }
}

class CombatStats {
    constructor(props, character) {
        this.character = function() {
            return character;
        }
        this.fatigue = 0;
    }

    get minimumDamageChance() {
        return Big(config.combat.baseMinimumDamageChance);
    }

    get medianDamageChance() {
        return Big(config.combat.baseMedianDamageChance);
    }

    get maximumDamageChance() {
        return Big(1).minus(this.minimumDamageChance).minus(this.medianDamageChance);
    }

    get minimumDamage() {
        const characterPowerLevel = this.character().powerLevel;
        const minimumDamageMultiplier = config.combat.defaultMinimumDamageMultiplier;
        const attributeModifier = this.character().attributes.brutality * config.combat.attributeDamageModifier;
        return characterPowerLevel.mul(minimumDamageMultiplier).times(1 + attributeModifier).round(0, 3);
    }

    get medianDamage() {
        const characterPowerLevel = this.character().powerLevel;
        const minimumDamageMultiplier = config.combat.defaultMedianDamageMultiplier;
        const attributeModifier = this.character().attributes.brutality * config.combat.attributeDamageModifier;
        return characterPowerLevel.mul(minimumDamageMultiplier).times(1 + attributeModifier).round(0, 3);
    }

    get maximumDamage() {
        const characterPowerLevel = this.character().powerLevel;
        const minimumDamageMultiplier = config.combat.defaultMaximumDamageMultiplier;
        const attributeModifier = this.character().attributes.brutality * config.combat.attributeDamageModifier;
        return characterPowerLevel.mul(minimumDamageMultiplier).times(1 + attributeModifier).round(0, 3);
    }
}