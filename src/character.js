import {config} from "./config";
import {Big} from "big.js";
import {getLevelForPower} from "./engine";

export class Character {
    constructor(props) {
        this.id = props.id;
        this._name = props.name || props._name;
        this._absorbedPower = Big(props.absorbedPower || props._absorbedPower || 0);
        this._currentHp = this.maximumHp;
        this._attributes = new Attributes(props.attributes || props._attributes);
        this._combat = new CombatStats(props.combat || props._combat, this);
        this._traits = props.traits || props._traits;
        this._appearance = props.appearance || props._appearance;
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
        return this.powerLevel.mul(5);
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

    gainPower(powerGained) {
        this._absorbedPower = this._absorbedPower.plus(powerGained);
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

    get minimumDamage() {
        return this.character().powerLevel.mul(config.combat.defaultMinimumDamageMultiplier).round(0, 3);
    }

    get medianDamage() {
        return this.character().powerLevel.mul(config.combat.defaultMedianDamageMultiplier).round(0, 3);
    }

    get maximumDamage() {
        return this.character().powerLevel.mul(config.combat.defaultMaximumDamageMultiplier).round(0, 3);
    }
}