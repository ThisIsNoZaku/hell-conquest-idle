import {config} from "../config";
import * as _ from "lodash";
import {Attributes, calculateCombatStat} from "../character";
import {Decimal} from "decimal.js";
import {Tactics} from "../data/Tactics";
import {Statuses} from "../data/Statuses";

export default class CharacterCombatState {
    constructor(originalCharacter, party) {
        this.id = originalCharacter.id;
        // FIXME: Symbols?
        this.attributes = new Attributes({
            brutality: originalCharacter.attributes.baseBrutality,
            deceit: originalCharacter.attributes.baseDeceit,
            cunning: originalCharacter.attributes.baseCunning,
            madness: originalCharacter.attributes.baseMadness
        }, originalCharacter);
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
        this.powerLevel = originalCharacter.powerLevel;
    }

    get combat() {
        return {
            precision: Decimal(this.precision),
            evasion: Decimal(this.evasion),
            power: Decimal(this.power),
            resilience: Decimal(this.resilience),
            minimumDamage: Decimal(this.damage.min),
            medianDamage: Decimal(this.damage.med),
            maximumDamage: Decimal(this.damage.max)
        }
    }

    get damageFromFatigue() {
        const maximumHp = this.maximumHp;
        const tacticsMultiplier = Tactics[this.tactics].modifiers.fatigue_multiplier || 0;
        const totalMultiplier = Decimal(1).plus(tacticsMultiplier);
        return maximumHp.times(totalMultiplier).div(100).floor();
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
        return calculateCombatStat(this, "power");
    }

    get resilience() {
        return calculateCombatStat(this, "resilience");
    }

    get precision() {
        return calculateCombatStat(this, "precision");
    }

    get evasion() {
        return calculateCombatStat(this, "evasion");
    }
}