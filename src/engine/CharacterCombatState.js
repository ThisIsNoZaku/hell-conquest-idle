import {config} from "../config";
import * as _ from "lodash";
import {assertHasProperty, Attributes, calculateCombatStat} from "../character";
import {Decimal} from "decimal.js";
import {Tactics} from "../data/Tactics";
import {Statuses} from "../data/Statuses";

export default class CharacterCombatState {
    constructor(originalCharacter, party) {
        assertHasProperty("powerLevel", originalCharacter);
        this.id = originalCharacter.id;
        this.isPc = originalCharacter.isPc;
        this.powerLevel = Decimal(originalCharacter.powerLevel);
        this.stolenPower = Decimal(originalCharacter.stolenPower || 0);
        // FIXME: Symbols?
        this.attributes = new Attributes({
            brutality: originalCharacter.attributes.baseBrutality,
            deceit: originalCharacter.attributes.baseDeceit,
            cunning: originalCharacter.attributes.baseCunning,
            madness: originalCharacter.attributes.baseMadness
        }, this);
        this.party = party;
        this.hp = Decimal(originalCharacter.hp);
        this._speed = Decimal(originalCharacter.speed || 100);
        this.maximumHp = Decimal(originalCharacter.maximumHp || this.hp);
        this.modifiers = [];
        this.tactics = originalCharacter.tactics || "defensive";
        this.traits = {...originalCharacter.traits};
        this.damage = {...originalCharacter.combat.damage};
        this.statuses = {...originalCharacter.statuses};

        this.maxPrecisonPoints = Decimal(originalCharacter.combat.maxPrecisonPoints || 0);
        this.maxEvasionPoints = Decimal(originalCharacter.combat.maxEvasionPoints || 0);

        this._precisionPoints = Decimal(originalCharacter.combat.precisionPoints || 0);
        this._evasionPoints = Decimal(originalCharacter.combat.evasionPoints || 0);

        this.fatigue = Decimal(originalCharacter.fatigue || 0);
    }

    get attackUpgradeCost() {
        const baseCost = config.mechanics.combat.attackUpgradeBaseCost;
        const tacticsMultiplier = Tactics[this.tactics].modifiers.attack_upgrade_cost_multiplier || 1;
        return Decimal(baseCost).times(tacticsMultiplier);
    }

    get incomingAttackDowngradeCost() {
        const baseCost = config.mechanics.combat.incomingAttackDowngradeBaseCost;
        const tacticsMultiplier = Tactics[this.tactics].modifiers.attack_downgrade_cost_multiplier || 1;
        return Decimal(baseCost).times(tacticsMultiplier);
    }

    get stolenPowerModifier() {
        return Decimal.min(1, this.stolenPower.div(this.powerLevel));
    }

    get precisionPoints(){
        return Decimal(this._precisionPoints);
    }

    set precisionPoints(newValue) {
        this._precisionPoints = newValue;
    }

    get evasionPoints(){
        return Decimal(this._evasionPoints);
    }

    set evasionPoints(newValue) {
        this._evasionPoints = newValue;
    }

    get combat() {
        return {
            precision: Decimal(this.precision),
            evasion: Decimal(this.evasion),
            power: Decimal(this.power),
            resilience: Decimal(this.resilience),
            damage: this.damage,
            maxPrecisionPoints: this.maxPrecisonPoints,
            maxEvasionPoints: this.maxEvasionPoints,
            precisionPoints: this._precisionPoints,
            _evasionPoints: this._evasionPoints
        }
    }

    get damageFromFatigue() {
        const maximumHp = this.maximumHp;
        const tacticsMultiplier = Tactics[this.tactics].modifiers.fatigue_multiplier || 0;
        const totalMultiplier = Decimal(1).plus(tacticsMultiplier);
        return maximumHp.times(totalMultiplier).times(config.mechanics.combat.fatigueDamageMultiplier).floor();
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

    get endurance() {
        return this.powerLevel.times(2).plus(1);
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