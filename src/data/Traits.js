import * as _ from "lodash";
import { validatedTrait } from "./schemas/traits";
import {TraitEffects} from "./TraitEffects";

// FIXME: Implement validation
export const Traits = {
    bloodrage: validatedTrait(generateTrait({
        name: "Blood Rage",
        icon: "./icons/icons-139.png",
        description: _.template("This demon's unquenchable thirst for blood causes it to gain ${tier} stacks of Berserk when an enemy has 50% or less health.")
    }, ["bloodthirsty", "tough"])),
    carrion_feeder: validatedTrait(generateTrait({
        name: "Carrion Feeder",
        icon: "./icons/icons-1.png",
        description: _.template("When this demon kills another, it gains ${tier} stacks of of Engorged, to a maximum of ${tier.times(10)}")
    }, ["cannibal"])),
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
        description: _.template("The demon's touch saps the strength from the victims limbs, reducing both Damage and Defense by <span>${tier.times(5)}%</span> for 1 round.")
    }),
    inescapableGrasp: validatedTrait(generateTrait({
        name: "Inescapable Grasp",
        icon: "./icons/icons-2221.png",
        description: _.template("On a critical hit you wrap around your enemy, inflicting ${tier} stack${tier.eq(1) ? '': 's'} of <em>Restrained</em> for 5 rounds."),
    }, ["grappler"])),
    killingBlow: validatedTrait(generateTrait({
        name: "Fatal Sting",
        description: _.template("You seek to end fights with a single strike, dealing ${tier.times(10)}% extra damage on a Devastating hit."),
        icon: "./icons/icons-1.png"
    }, ["killer", "painfulVenom"])),
    immortalWarrior: validatedTrait(generateTrait({
        name: "Immortal Warrior",
        icon: "./icons/icons-1.png",
        description: _.template("Your relentless attacks make your attacks hard to deflect, increasing the cost to downgrade your attacks by ${tier.times(10)}%.")
    }, ["mindless", "unstoppable"])),
    piercingStrike: validatedTrait(generateTrait({
        name: "Deadly Strikes",
        icon: "./icons/icons-113.png",
        description: _.template("Your fierce attacks can punch right through even armor. Your <span style='color: lightgreen'>Precision</span> is increased by <span style='color: orangered'>${tier.times(25)}%</span>")
    }, ["precise", "evasive"])),
    relentless: validatedTrait(generateTrait({
        name: "Tirelress",
        description: _.template("Your indomitability increases your Energy by ${tier.times(20)}%."),
        icon: "./icons/icons-110.png"
    }, ["relentless"])),
    sadisticJoy: validatedTrait(generateTrait({
        name: "Sadistic Joy",
        icon: "./icons/icons-852.png",
        description: _.template("The demon gains vile pleasure from the pain it inflicts, regaining Energy equal to ${tier.times(5)}% from hitting."),
    }, ["bloodthirsty", "sadistic"])),
    searingVenom: validatedTrait(generateTrait({
        name: "Poisonous Hunter",
        icon: "./icons/icons-4.png",
        description: _.template("Your agonizing venom causes such intense pain that the victim suffers an extra ${tier.times(5)}% damage from attacks.")
    }, ["painfulVenom", "swift"])),
    sharedPain: validatedTrait(generateTrait({
        name: "Shared Pain",
        icon: "./icons/icons-146.png",
        description: _.template("You return the pain of injuries inflicted on you, reflecting <span style='color: orangered'>${tier.times(20).toFixed()}%</span> of the damage back.")
    }, ["thorns"])),
    swiftEvasion: validatedTrait(generateTrait({
        name: "Night Hunter",
        icon: "./icons/icons-595.png",
        description: _.template("Your agility increases your Evasion by ${tier.times(10)}%.")
    }, ["evasive"])),
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
        return Object.assign(previousValue, TraitEffects[currentValue]);
    }, baseObject);
}