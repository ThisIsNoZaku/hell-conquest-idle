export default class CharacterCombatState {
    constructor(props) {
        this.hp = props.hp;
        this._speed = props.speed;
        this._fatigue = 0;
        this.lastActed = 0;
        this.modifiers = [];
    }

    get speed() {
        const baseSpeed = this._speed;
        const modifiedSpeed = this.modifiers.reduce((currentValue, modifier) => {
            if(modifier.effects.speed) {
                const multiplier = (modifier.effects.speed.percent.plus(100))/100
                return currentValue.mul(multiplier);
            }
            return currentValue;
        }, baseSpeed);
        return modifiedSpeed;
    }

    get fatigue() {
        return this._fatigue;
    }

    set fatigue(fatigue) {
        this._fatigue = fatigue;
    }

}