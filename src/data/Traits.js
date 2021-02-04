import * as _ from "lodash";
import { validatedTrait } from "./schemas/traits";
import {TraitEffects} from "./TraitEffects";

// FIXME: Implement validation
export const Traits = {
    bloodrage: validatedTrait(generateTrait({
        name: "Blood Rage",
        icon: "./icons/icons-139.png",
        enabled: true,
        description: _.template("A brutal and savage warrior, this Demon gains a  gains a ${tier.times(25)}% bonus to <strong>Resilience</strong> and ${tier} stacks of <strong>Berserk</strong> when hitting with an attack.")
    }, ["bloodthirsty", "tough"])),
    carrion_feeder: validatedTrait(generateTrait({
        name: "Carrion Feeder",
        icon: "./icons/icons-523.png",
        enabled: true,
        description: _.template("Consuming not just the energy but the flesh of the vanquished, this Demon has a ${tier.times(10)}% penalty to Power and Resilience and a ${tier.times(20)}% bonus to Evasion and Precision due to its size and gains ${tier} stack(s) of <strong>Engorged</strong> on kill.")
    }, ["cannibal", "small"])),
    cupidity: validatedTrait({
        name: "Cupidity",
        icon: "./icons/icons-2503.png",
        enabled: false,
        description: _.template("When this demon successfully Intimidates another demon, it gains a <span style='color: red'>${tier}%</span> chance to seize the intimidated demon's Artifacts as though it were killed."),
        on_intimidate: {
            trigger_effects: {
                steal_item: {
                    target: "enemy"
                }
            }
        }
    }),
    exhaustingTouch: validatedTrait({
        name: "Strangulation",
        icon: "./icons/icons-115.png",
        enabled: true,
        description: _.template("The Demon saps the strength from the victims limbs, reducing both Damage and Defense by <span>${tier.times(5)}%</span> for 1 round.")
    }),
    fortressOfMadness: validatedTrait({
        name: "Fortress of Madness",
        icon: "./icons/icons-856.png",
        description: _.template("Your madness twists your enemy's body as it twists your own mind, reflecting ${tier.times(20)}% of damage taken and statuses applied by the enemy to you.")
    }, ["reversal", "thorns"]),
    inescapableGrasp: validatedTrait(generateTrait({
        name: "Inescapable Grasp",
        icon: "./icons/icons-2221.png",
        enabled: true,
        description: _.template("This primary strategy of this Demon is to restrain and crush it's foes, inflicting ${tier} stacks of <strong>Restrained</strong> and <strong>Crushed</strong> on hit."),
    }, ["grappler", "crushing"])),
    killingBlow: validatedTrait(generateTrait({
        name: "Fatal Sting",
        description: _.template("This Demon seeks to end fights with killer blows and deadly venom, inflicting inflicting ${tier.times(50)}% more damage on Devastating hits and ${tier} stacks of <strong>Poisoned</strong>."),
        icon: "./icons/icons-2278.png",
        enabled: true,
    }, ["killer", "venomous"])),
    immortalWarrior: validatedTrait(generateTrait({
        name: "Immortal Warrior",
        icon: "./icons/icons-795.png",
        enabled: true,
        description: _.template("This Demon's mindless stamina increases the cost to downgrade its attacks by ${tier.times(10)}% and reduces Psychic damage by ${tier.times(20)}%.")
    }, ["mindless", "unstoppable"])),
    piercingStrike: validatedTrait(generateTrait({
        name: "Deadly Strikes",
        icon: "./icons/icons-113.png",
        enabled: true,
        description: _.template("This Demon dances around foes while it's fierce attacks can punch right through even armor, increasing both Precision and Evasion by ${tier.times(25)}%. ")
    }, ["precise", "evasive"])),
    relentless: validatedTrait(generateTrait({
        name: "Tireless",
        description: _.template("The indomitability of this Demon increases maximum and generated Energy by ${tier.times(25)}% and increases resilience by ${tier.times(25)}%."),
        enabled: true,
        icon: "./icons/icons-110.png"
    }, ["relentless", "tough"])),
    sadisticJoy: validatedTrait(generateTrait({
        name: "Sadistic Joy",
        icon: "./icons/icons-852.png",
        enabled: true,
        description: _.template("The Demon gains vile pleasure from the pain it inflicts, regaining Energy equal to ${tier.times(5)}% and gaining ${tier} stacks of <strong>Berserk</strong> on hitting with an attack."),
    }, ["bloodthirsty", "sadistic"])),
    searingVenom: validatedTrait(generateTrait({
        name: "Poisonous Hunter",
        icon: "./icons/icons-4.png",
        enabled: true,
        description: _.template("Sudden strikes and deadly venom are what this Demon uses to kill, inflicting ${tier} stacks of <strong>Poisoned</strong> on hit.")
    }, ["venomous", "swift"])),
    sharedPain: validatedTrait(generateTrait({
        name: "Shared Pain",
        icon: "./icons/icons-146.png",
        enabled: true,
        description: _.template("This Demon inflicts the damage it suffers back on attackers, reflecting <span style='color: orangered'>${tier.times(25).toFixed()}%</span> of the damage it takes.")
    }, ["thorns"])),
    swiftEvasion: validatedTrait(generateTrait({
        name: "Night Hunter",
        icon: "./icons/icons-595.png",
        enabled: true,
        description: _.template("Your agility and size increases your Evasion by ${tier.times(60)}%, Precision by ${tier.times(20)}% and reduces Power by ${tier.times(10)}%.")
    }, ["small", "precise"])),
    terrifyingSkitter: validatedTrait(generateTrait({
        name: "Sinister Hunter",
        icon: "./icons/icons-2260.png",
        enabled: true,
        description: _.template("The sickening sound of your feet on the ground unnerves even other demons, inflicting ${tier} stacks of <span style='color: violet'>Terrified</span> for <span style='color: lightblue'>10</span> round(s).")
    }, ["frightening", "grappler"]))
}

export function getTrait(traitId) {
    return Traits[traitId];
}

export function generateTrait(baseObject, traits) {
    return validatedTrait(traits.reduce((previousValue, currentValue)=>{
        if(!TraitEffects[currentValue]) {
            throw new Error(currentValue);
        }
        return _.mergeWith(previousValue, TraitEffects[currentValue], function(objValue, srcValue, key, object, source, stack){
            switch(key) {
                case "add_statuses":
                    return Object.assign(srcValue, objValue || {});
                case "evasion_modifier":
                case "precision_modifier":
                case "power_modifier":
                case "resilience_modifier":
                    if(objValue &&_.get(objValue, "target") !== srcValue.target) {
                        throw new Error();
                    }
                    return {
                        target: srcValue.target,
                        value: srcValue.value + _.get(objValue, "value", 0)
                    }
            }
        });
    }, baseObject));
}