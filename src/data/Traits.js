import * as _ from "lodash";
import { validatedTrait } from "./schemas/traits";
import {TraitEffects} from "./TraitEffects";

// FIXME: Implement validation
export const Traits = {
    bloodrage: validatedTrait(generateTrait({
        name: "Blood Rage",
        icon: "./icons/icons-139.png",
        description: _.template("A brutal and savage warrior, this Demon gains a ${tier.plus(1).times(100)}% multiplier to Resilience and ${tier} stacks of <strong>Beserk</strong> when hitting with an attack and gains a ${tier.times(10)}% bonus to <strong>Resilience</strong>.")
    }, ["bloodthirsty", "tough"])),
    carrion_feeder: validatedTrait(generateTrait({
        name: "Carrion Feeder",
        icon: "./icons/icons-1.png",
        description: _.template("Consuming not just the energy but the flesh of the vanquished, this Demon has a ${tier.times(.1)}% penalty to Power and a ${tier.times(.1)}% bonus to Evasion and Precision and gains ${tier} stack(s) of <strong>Engorged</strong> on kill, to a max of ${tier.times(10)}.")
    }, ["cannibal", "small"])),
    cupidity: validatedTrait({
        name: "Cupidity",
        icon: "./icons/icons-2503.png",
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
        description: _.template("The Demon saps the strength from the victims limbs, reducing both Damage and Defense by <span>${tier.times(5)}%</span> for 1 round.")
    }),
    inescapableGrasp: validatedTrait(generateTrait({
        name: "Inescapable Grasp",
        icon: "./icons/icons-2221.png",
        description: _.template("This primary strategy of this Demon is to restrain and crush it's foes, inflicting a stack of <strong>Restrained</strong> for ${tier} rounds and also ${tier} stacks of <strong>Crushed</strong> on hit."),
    }, ["grappler", "crushing"])),
    killingBlow: validatedTrait(generateTrait({
        name: "Fatal Sting",
        description: _.template("This Demon seeks to end fights with killer blows and deadly venom, inflicting ${tier} stacks of <strong>Agonizing Venom</strong> and inflicting ${tier.times(10)}% more damage on Devastating hits."),
        icon: "./icons/icons-1.png"
    }, ["killer", "painfulVenom"])),
    immortalWarrior: validatedTrait(generateTrait({
        name: "Immortal Warrior",
        icon: "./icons/icons-1.png",
        description: _.template("This Demon's undead stamina increases the cost to downgrade its attacks by ${tier.times(10)}% and increases its Energy by ${tier.times(20)}.")
    }, ["mindless", "unstoppable"])),
    piercingStrike: validatedTrait(generateTrait({
        name: "Deadly Strikes",
        icon: "./icons/icons-113.png",
        description: _.template("This Demon dances around foes while it's fierce attacks can punch right through even armor, increasing both Precision and Evasion by ${tier.times(20)}%. ")
    }, ["precise", "evasive"])),
    relentless: validatedTrait(generateTrait({
        name: "Tirelress",
        description: _.template("The indomitability of this Demon increases Energy by ${tier.times(20)}% and increases resilience by ${tier.times(40)}%."),
        icon: "./icons/icons-110.png"
    }, ["relentless", "tough"])),
    sadisticJoy: validatedTrait(generateTrait({
        name: "Sadistic Joy",
        icon: "./icons/icons-852.png",
        description: _.template("The Demon gains vile pleasure from the pain it inflicts, regaining Energy equal to ${tier.times(5)}% and gaining ${tier} stacks of <strong>Berserk</strong>."),
    }, ["bloodthirsty", "sadistic"])),
    searingVenom: validatedTrait(generateTrait({
        name: "Poisonous Hunter",
        icon: "./icons/icons-4.png",
        description: _.template("Sudden strikes and deadly venom are what this Demon uses to kill, inflicting ${tier} stacks of <strong>Agonizing Venom</strong> with Devastating hits.")
    }, ["painfulVenom", "swift"])),
    sharedPain: validatedTrait(generateTrait({
        name: "Shared Pain",
        icon: "./icons/icons-146.png",
        description: _.template("This Demon inflicts the damage it suffers back on attackers, reflecting <span style='color: orangered'>${tier.times(25).toFixed()}%</span> of the damage it takes.")
    }, ["thorns"])),
    swiftEvasion: validatedTrait(generateTrait({
        name: "Night Hunter",
        icon: "./icons/icons-595.png",
        description: _.template("Your agility and size increases your Evasion by ${tier.times(50)}%, Precision by ${tier.times(20)}% and reduces Power by ${tier.times(10)}%.")
    }, ["evasive", "small"])),
    terrifyingSkitter: validatedTrait(generateTrait({
        name: "Sinister Hunter",
        icon: "./icons/icons-2260.png",
        description: _.template("The sickening sound of your feet on the ground unnerves even other demons, making the enemy <span style='color: violet'>Terrified</span> for <span style='color: lightblue'>${tier.div(10).round(0, 0).plus(1).toFixed()}</span> round(s), stunning them.")
    }, ["frightening", "grappler"]))
}

export function getTrait(traitId) {
    return Traits[traitId];
}

export function generateTrait(baseObject, traits) {
    return traits.reduce((previousValue, currentValue)=>{
        if(!TraitEffects[currentValue]) {
            throw new Error(currentValue);
        }
        return _.mergeWith(previousValue, TraitEffects[currentValue], function(objValue, srcValue, key, object, source, stack){
            switch(key) {
                case "add_statuses":
                    return Object.assign(srcValue, objValue || {});
                case "evasion_modifier":
            }
        });
    }, baseObject);
}