import {config} from "./config";
import {evaluateExpression, getGlobalState, getLevelForPower, getPowerNeededForLevel} from "./engine";
import {Creatures} from "./data/creatures";
import {Decimal} from "decimal.js";
import {Tactics} from "./data/Tactics";
import {Statuses} from "./data/Statuses";
import * as _ from "lodash";
import {Traits} from "./data/Traits";

export class Character {
    constructor(props) {
        this.adjectives = props.adjectives;
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
        this.highestLevelReached = props.highestLevelReached;
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
        return this.powerLevel
            .times(attributeMultiplier.plus(1))
            .mul(config.mechanics.combat.hp.pointsPerLevel)
            .plus(this._isPc ? config.mechanics.combat.hp.pcBonus : 0)
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

    get baseBrutality() {
        return Decimal(this._brutality).floor();
    }

    get baseCunning() {
        return Decimal(this._cunning).floor();
    }

    get baseDeceit() {
        return Decimal(this._deceit).floor();
    }

    get baseMadness() {
        return Decimal(this._madness).floor();
    }

    get brutality() {
        const latentPowerBonus = this.character().latentPower.times(config.mechanics.reincarnation.latentPowerEffectScale)
            .times(this.character().isPc ? this.character().highestLevelReached : this.character().powerLevel).floor();
        return Decimal(this._brutality).plus(latentPowerBonus).toDecimalPlaces(1);
    }

    get cunning() {
        const latentPowerBonus = this.character().latentPower.times(config.mechanics.reincarnation.latentPowerEffectScale)
            .times(this.character().isPc ? this.character().highestLevelReached : this.character().powerLevel).floor();
        return Decimal(this._cunning).plus(latentPowerBonus).toDecimalPlaces(1);
    }

    get deceit() {
        const latentPowerBonus = this.character().latentPower.times(config.mechanics.reincarnation.latentPowerEffectScale)
            .times(this.character().isPc ? this.character().highestLevelReached : this.character().powerLevel).floor();
        return Decimal(this._deceit).plus(latentPowerBonus).toDecimalPlaces(1);
    }

    get madness() {
        const latentPowerBonus = this.character().latentPower.times(config.mechanics.reincarnation.latentPowerEffectScale)
            .times(this.character().isPc ? this.character().highestLevelReached : this.character().powerLevel).floor();
        return Decimal(this._madness).plus(latentPowerBonus).toDecimalPlaces(1);
    }
}

class CombatStats {
    constructor(props, character) {
        this.character = function () {
            return character;
        }
    }

    get minimumDamage() {
        return calculateDamage("min", this.character()).floor();
    }

    get medianDamage() {
        return calculateDamage("med", this.character()).floor();
    }

    get maximumDamage() {
        return calculateDamage("max", this.character()).floor();
    }

    get evasion() {
        return calculateCombatStat(this.character(), "evasion");
    }

    get precision() {
        return calculateCombatStat(this.character(), "precision");
    }

    get resilience() { // TODO: Refactor all these into a shared method.
        return calculateCombatStat(this.character(), "resilience");
    }

    get power() {
        return calculateCombatStat(this.character(), "power");
    }

}

function calculateDamage(hitType, character) {
    const baseDamage = evaluateExpression(config.mechanics.combat.baseDamage, {
        player: character
    });
    const hitTypeDamageMultiplier = config.mechanics.combat[`default${hitType.substring(0, 1).toUpperCase()}${hitType.substring(1)}DamageMultiplier`];
    const tacticsModifier = Tactics[character.tactics].modifiers[`${hitType}_hit_damage_modifier`] || 0;
    const totalDamageMultiplier = Decimal(hitTypeDamageMultiplier).plus(tacticsModifier);
    return baseDamage
        .times(totalDamageMultiplier).ceil();
}

export function calculateCombatStat(character, combatAttribute) {
    const attributeBase = character.attributes[config.mechanics.combat[combatAttribute].baseAttribute];
    const tacticsModifier = Decimal(0).plus(Tactics[character.tactics].modifiers[`${combatAttribute}_modifier`] || 0);
    const statusesModifier = Object.keys(character.statuses).reduce((currentValue, nextStatus) => {
        const statusDefinition = Statuses[nextStatus];
        return currentValue.plus(statusDefinition.effects[`${combatAttribute}_modifier`] || 0);
    }, Decimal(0));
    const traitModifier = Object.keys(character.traits).reduce((previousValue, trait) => {
        const traitDefinition = Traits[trait];
        if(_.get(traitDefinition, ["continuous", "effects", `${combatAttribute}_modifier`, "target"]) === "self") {
            return previousValue.plus(evaluateExpression(_.get(traitDefinition, ["continuous", "effects", `${combatAttribute}_modifier`, "modifier"]), {
                rank: Decimal(character.traits[trait])
            }));
        }
        return previousValue;
    }, Decimal(0));
    return attributeBase.times(tacticsModifier.plus(statusesModifier).plus(traitModifier).plus(1));
}