import {config} from "../config";
import * as _ from "lodash";
import {Attributes} from "../character";
import {Decimal} from "decimal.js";
import {Tactics} from "../data/Tactics";

export default class CharacterCombatState {
    constructor(originalCharacter, party) {
        this.id = originalCharacter.id;
        // FIXME: Symbols?
        this.attributes = new Attributes(originalCharacter.attributes, originalCharacter);
        this.party = party;
        this.hp = originalCharacter.currentHp;
        this._speed = originalCharacter.speed;
        this.maximumHp = originalCharacter.maximumHp;
        this.fatigue = 0;
        this.lastActed = 0;
        this.modifiers = [];
        this.tactics = originalCharacter.tactics;
        this.traits = {...originalCharacter.traits};
        this.lastActed = 0;
        this.damage = {
            min: originalCharacter.combat.minimumDamage,
            med: originalCharacter.combat.medianDamage,
            max: originalCharacter.combat.maximumDamage
        }
    }

    set speed(newSpeed) {
        this._speed = newSpeed;
    }

    get speed() {
        const baseSpeed = this._speed;
        const speedMultiplier = this.modifiers.reduce((currentValue, modifier) => {
            if(modifier.effects.speed) {
                const multiplier = (modifier.effects.speed.percent.plus(100))/100
                return currentValue.plus(multiplier);
            }
            return currentValue;
        }, _.get(config.tactics, this.tactics, 1));
        return baseSpeed.times(speedMultiplier);
    }

    get isAlive(){
        return this.hp.gt(0);
    }

    get canAct() {
        return this.modifiers.reduce((canAct, nextModifier) => {
            if(nextModifier.effects.stunned !== undefined) {
                return false;
            } else {
                return canAct;
            }
        }, true)
    }

    get power() {
        const attributeBase = this.attributes[config.mechanics.combat.attackDamage.baseAttribute];
        return attributeBase;
    }

    get resilience() {
        const attributeBase = this.attributes[config.mechanics.combat.defense.baseAttribute];
        return attributeBase;
    }

    get precision() {
        const attributeBase = this.attributes[config.mechanics.combat.precision.baseAttribute];
        return attributeBase;
    }

    get evasion() {
        const attributeBase = this.attributes[config.mechanics.combat.evasion.baseAttribute];
        const tacticsModifier = Decimal(1).plus(Tactics[this.tactics].evasion_modifier || 0);
        return attributeBase.times(tacticsModifier);
    }
}