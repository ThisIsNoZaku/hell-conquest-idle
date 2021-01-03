import {config} from "../config";
import * as _ from "lodash";
import {Attributes} from "../character";
import {Decimal} from "decimal.js";
import {Tactics} from "../data/Tactics";
import {Statuses} from "../data/Statuses";

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
        this.damage = {
            min: originalCharacter.combat.minimumDamage,
            med: originalCharacter.combat.medianDamage,
            max: originalCharacter.combat.maximumDamage
        }
        this.statuses = {...originalCharacter.statuses};
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

    get accuracy() {
        const baseAccuracy = Decimal(config.mechanics.combat.baseHitChance);
        const statusesMultiplier = Decimal(1).minus(
            Decimal(Statuses["restrained"].effects.accuracy_modifier)
            .times(this.statuses["restrained"] || 0));
        return baseAccuracy.times(statusesMultiplier);
    }

    get canAct() {
        return Object.keys(this.statuses).reduce((canAct, nextStatus) => {
            return canAct && !Statuses[nextStatus].effects.skip_turn;
        }, true);
    }

    get power() {
        const attributeBase = this.attributes[config.mechanics.combat.power.baseAttribute];
        const tacticsModifier = Decimal(1).plus(Tactics[this.tactics].power_modifier || 0);
        const statusesModifier = Object.keys(this.statuses).reduce((currentValue, nextStatus) => {
            const statusDefinition = Statuses[nextStatus];
            return currentValue.plus(statusDefinition.effects.power_multiplier || 0).minus(1);
        }, Decimal(1));
        return attributeBase.times(tacticsModifier.plus(statusesModifier));
    }

    get resilience() {
        const attributeBase = this.attributes[config.mechanics.combat.resilience.baseAttribute];
        const tacticsModifier = Decimal(1).plus(Tactics[this.tactics].resilience_modifier || 0);
        const statusesModifier = Object.keys(this.statuses).reduce((currentValue, nextStatus) => {
            const statusDefinition = Statuses[nextStatus];
            return currentValue.plus(statusDefinition.effects.resilience_multiplier || 0).minus(1);
        }, Decimal(1));
        return attributeBase.times(tacticsModifier.plus(statusesModifier));
    }

    get precision() {
        const attributeBase = this.attributes[config.mechanics.combat.precision.baseAttribute];
        const tacticsModifier = Decimal(1).plus(Tactics[this.tactics].precison_modifier || 0);
        const statusesModifier = Object.keys(this.statuses).reduce((currentValue, nextStatus) => {
            const statusDefinition = Statuses[nextStatus];
            return currentValue.plus(statusDefinition.effects.precision_multiplier || 0).minus(1);
        }, Decimal(1));
        return attributeBase.times(tacticsModifier.plus(statusesModifier));
    }

    get evasion() {
        const attributeBase = this.attributes[config.mechanics.combat.evasion.baseAttribute];
        const tacticsModifier = Decimal(1).plus(Tactics[this.tactics].evasion_modifier || 0);
        const statusesModifier = Object.keys(this.statuses).reduce((currentValue, nextStatus) => {
            const statusDefinition = Statuses[nextStatus];
            return currentValue.plus(statusDefinition.effects.evasion_multiplier || 0).minus(1);
        }, Decimal(1));
        return attributeBase.times(tacticsModifier.plus(statusesModifier));
    }
}