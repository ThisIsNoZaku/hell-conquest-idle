import * as _ from "lodash";
import { validatedTrait } from "./schemas/traits";
import {TraitEffects} from "./TraitEffects";

// FIXME: Implement validation
export const Traits = {
    atavisticConsumption: validatedTrait(generateTrait({
        name: "Atavistic Consumption",
        icon: "./icons/icons-1.png",
        description: _.template("This Demon hunger gives ${tier} stacks of Engorged on kill and recovers Health equal to ${tier.times(5)}% of maximum health by spending Energy equal to ${tier.times(5)}% of maximum stamina each round.")
    }, ["regenerative", "cannibal"])),
    balefulGaze: validatedTrait(generateTrait({
        name: "Baleful Gaze",
        icon: "./icons/icons-1.png",
        description: _.template("This demon's magical sight give it uncanny precision and weakens magic, increasing precision by ${tier.times(25)}% and making enemy attack and defense enhancements cost ${tier.times(10)}% per level.")
    }, ["precise", "neutralizing"])),
    bloodrage: validatedTrait(generateTrait({
        name: "Blood Rage",
        icon: "./icons/icons-139.png",
        enabled: true,
        description: _.template("A brutal and savage warrior, this Demon gains a  gains a ${tier.times(25)}% bonus to <strong>Resilience</strong> and ${tier} stacks of <strong>Berserk</strong> when hitting with an attack.")
    }, ["bloodthirsty", "tough"])),
    bloodHunger: validatedTrait(generateTrait({
        name: "Blood Hunger",
        icon: "./icons/icons-1.png",
        description: _.template("This demon steals the life force from the enemy even before cracking open their mortal shell, recovering ${tier}% of maximum health on a hit, while its dread gaze inflicting ${tier} stacks of <span style='color: violet'>Frightened</span> for <span style='color: lightblue'>10</span> round(s)")
    }, ["frightening", "vampiric"])),
    boneHunter: validatedTrait(generateTrait({
        name: "Bone Hunter",
        description: _.template("This Demon's relentless drive to take down its prey makes it Mindless and increases its maximum and generated Energy by ${tier.times(25)}%.")
    }, ["mindless", "relentless"])),
    boneMagic: validatedTrait(generateTrait({
        name: "Bone Magic",
        description: _.template("This Demon's hunger for knowledge transcended even death, ")
    }, ["mindless", "arcane"])),
    cannonBall: validatedTrait(generateTrait({
        name: "Cannonball",
        icon: "./icons/icons-1.png",
        description: _.template("This Demon rockets through the air and slams into targets,")
    }, ["flying", "unstoppable"])),
    carrion_feeder: validatedTrait(generateTrait({
        name: "Carrion Feeder",
        icon: "./icons/icons-523.png",
        enabled: true,
        description: _.template("Consuming not just the energy but the flesh of the vanquished, this Demon has a ${tier.times(10)}% penalty to Power and Resilience and a ${tier.times(20)}% bonus to Evasion and Precision due to its size and gains ${tier} stack(s) of <strong>Engorged</strong> on kill.")
    }, ["cannibal", "small"])),
    consumingFlames: validatedTrait(generateTrait({
        name: "Consuming Flames",
        icon: "./icons/icons-1.png",
        description: _.template("This Demon is made of living flames, it's insubstantial nature reducing the damage it takes and receives by ${tier.times(25)}% and its touch add ${tier} stacks of Burning.")
    }, ["insubstantial", "fiery"])),
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
    deadlySwarm: validatedTrait({
        name: "Deadly Swarm",
        enabled: true,
        description: _.template("This demon takes the form of a swarm of tiny, stinging insects, gaining a ${tier.times(50)}% bonus to Evasion and Precision but a ${tier.times(25)}% penalty to Power and Resilience, and it's size means the damage inflicted and taken is ${tier.times(25)}% less.")
    }, ["tiny", "insubstantial"]),
    deeaboo: validatedTrait({
        name: "Demon Form",
        icon: "./icons/icons-1.png",
        enabled: true,
        description: _.template("This Demon has reshaped itself to have a massive 'ultimate demon form', gaining ${tier.times(20)}% bonus to Power and Resilience and a ${tier.times(10)}% penalty to Precision and Evasion and it's blocks are ${tier.times(25)}% more difficult to block.")
    }, ["large", "unstoppable"]),
    demonMaster: validatedTrait({
        name: "Demon Master",
        enabled: true,
        description: _.template("This Demon's extensive knowledge of a variety of demons let it use enemy Traits against them and enhance their Blocks with magic.")
    }, ["learned", "arcane"]),
    plagueHarbinger: validatedTrait({
        name: "Plague Harbinger",
        enabled: true,
        description: _.template("")
    }, ["small", "diseased"]),
    eerieWatcher: validatedTrait(generateTrait({
        name: "Eerie Watcher",
        icon: "./icons/icons-1.png",
        description: _.template("This strange Demon likes to... watch, giving it a ${tier.times(25)} bonus to Precision and is Psychic.")
    }, ["precise", "psychic"])),
    exhaustingTouch: validatedTrait(generateTrait({
        name: "Strangulation",
        icon: "./icons/icons-115.png",
        enabled: true,
        description: _.template("The Demon saps the strength from the victims limbs, reducing both Damage and Defense by <span>${tier.times(5)}%</span> for 1 round.")
    }, ["insubstantial", "choking"])),
    fireBird: validatedTrait({
        name: "Fire Bird",
        enabled: true,
        description: _.template("This Demon, imbued with Hellfire, can fly through the air and its attacks Burn enemies.")
    }, ["flying", "fire"]),
    freakyFishGuy: validatedTrait(generateTrait({
        name: "Thassalophilia",
        enabled: true,
        description: _.template("This Demon's strange ways makes it hard to predict its actions, increasing Precision and Evasion by ${tier.times(10)}% and the enemy cannot use this Demon's action when determining it's own and at the beginning of combat enemies gain ${tier} stacks of Frightened for 10 rounds.")
    }, ["inscrutable", "frightening"])),
    fortressOfMadness: validatedTrait(generateTrait({
        name: "Fortress of Madness",
        icon: "./icons/icons-856.png",
        description: _.template("Your madness twists your enemy's body as it twists your own mind, reflecting ${tier.times(20)}% of damage taken and statuses applied by the enemy to you.")
    }, ["reversal", "thorns"])),
    heartlessMountain: validatedTrait(generateTrait({
        name: "Heartlessness of the Mountain",
        icon: "./icons/icons-1.png",
        description: _.template("This demon embodies the desolation of a wind-swept peak and the devastation of an avalance, gaining a ${tier.times(50)}% bonus to Power and Resilience with a ${tier.times(25)}% penalty to Evasion and Precision while it's attacks are ${tier.times(25)} more difficult to Block.")
    }, [
        "massive", "unstoppable"
    ])),
    immortalWarrior: validatedTrait(generateTrait({
        name: "Immortal Warrior",
        icon: "./icons/icons-795.png",
        enabled: true,
        description: _.template("This Demon's mindless stamina makes it ${tier.times(25)}% harder to block it's attacks and reduces Psychic damage by ${tier.times(20)}%.")
    }, ["mindless", "unstoppable"])),
    inescapableGrasp: validatedTrait(generateTrait({
        name: "Inescapable Grasp",
        icon: "./icons/icons-2221.png",
        enabled: true,
        description: _.template("This primary strategy of this Demon is to restrain and crush it's foes, inflicting ${tier} stacks of <strong>Restrained</strong> and <strong>Crushed</strong> on hit."),
    }, ["grappler", "crushing"])),
    inverted: validatedTrait(generateTrait({
        name: "Inverted",
        enabled: true,
        description: _.template("This strange Demon returns both ${tier.times(25)}% of damage received")
    }, ["thorns", "reversal"])),
    killingBlow: validatedTrait(generateTrait({
        name: "Fatal Sting",
        description: _.template("This Demon seeks to withstand attacks with a hard carapace and end fights by injecting deadly venom, inflicting ${tier} stacks of <strong>Poisoned</strong> for 5 rounds and gaining a ${tier.times(25)}% bonus to Resilience."),
        icon: "./icons/icons-2278.png",
        enabled: true,
    }, ["tough", "venomous"])),
    lifetimeOfPain: validatedTrait(generateTrait({
        name: "Lifetime Of Pain",
        description: _.template("This Demon countless eons of suffering means it does not simply ignore pain, it embraces it, gaining energy to ${tier.times(10)}% of max on taking damage")
    }, ["robust", "masochistic"])),
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
    reptileMystic: validatedTrait(generateTrait({
        name: "Reptilian Mystic",
        description: _.template("This Demon's knowledge of a reptilian people's esoteric theology, gives it a ${tier.times(10)}% bonus to Precision and Evasion, makes it Holy and prevents the enemy from knowing it's action when determining it's own action.")
    }, ["holy", "inscrutable"])),
    rotMouth: validatedTrait(generateTrait({
        name: "Biting Lizard",
        icon: "./icons/icons-1.png",
        description: _.template("The fouless of")
    }, ["coldBlooded", "venomous"])),
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
    shadowHulk: validatedTrait(generateTrait({
        name: "Shadow Hulk",
        enabled: true,
        description: _.template("This Demon, massive yet always shrouded in darkness, toys with it's prey before breaking their backs.")
    }, ["evasive", "large"])),
    sharedPain: validatedTrait(generateTrait({
        name: "Shared Pain",
        icon: "./icons/icons-146.png",
        enabled: true,
        description: _.template("This Demon inflicts the damage it suffers back on attackers, reflecting <span style='color: orangered'>${tier.times(25).toFixed()}%</span> of the damage it takes.")
    }, ["thorns"])),
    spiderHunter: validatedTrait(generateTrait({
        name: "Spider Queen's Chosen",
        enabled: true,
        description: _.template("This Demon's evil patron has blessed it with the ability to summon darkness, gaining ${tier} stacks of Untouchable when Dodging and increases Evasion by ${tier.times(25)}%.")
    }, ["summonDarkness", "evasive"])),
    spiderMage: validatedTrait(generateTrait({
        name: "Spider Queen's Scholar",
        enabled: true,
        description: _.template("This Demon's evil patron has blessed it with the ability to summon darkness and wield magic, gaining ${tier} stacks of Untouchable when Dodging and gaining the enemy's traits.")
    }, ["summonDarkness", "learned"])),
    stormyPersonality: validatedTrait(generateTrait({
        name: "Stormy Personality",
        icon: "./icons/icons-1.png",
        enabled: true,
        description: _.template("This demon's insubstantial form makes it difficult to harm, reducing damage taken and received by ${tier.times(25)}% and increases Evasion by ${tier.times(25)}%.")
    }, ["insubstantial", "evasive"])),
    swiftEvasion: validatedTrait(generateTrait({
        name: "Night Hunter",
        icon: "./icons/icons-595.png",
        enabled: true,
        description: _.template("Your size and unique senses increases your Evasion by ${tier.times(20)}%, Precision by ${tier.times(45)}% and reduces Power by ${tier.times(10)}%.")
    }, ["small", "precise"])),
    teleportingHunter: validatedTrait(generateTrait({
        name: "Teleporting Hunter",
        enabled: true,
        description: _.template("")
    })),
    terrifyingSkitter: validatedTrait(generateTrait({
        name: "Sinister Hunter",
        icon: "./icons/icons-2260.png",
        enabled: true,
        description: _.template("The sickening sound of your feet on the ground unnerves even other demons, inflicting ${tier} stacks of <span style='color: violet'>Terrified</span> for <span style='color: lightblue'>10</span> round(s).")
    }, ["frightening", "grappler"])),
    thickSkin: validatedTrait(generateTrait({
        name: "Thick Skin",
        enabled: true,
        description: _.template("This Demon's hard shell and strong limbs give it a ${tier.times(25)}% bonus to Resilience and it's hardest hits inflict ${tier.times(50)}% more damage.")
    }, ["tough", "killer"])),
    undertow: validatedTrait(generateTrait({
        name: "Undertow",
        enabled: true,
        description: _.template("This Demon's liquid form makes it difficult to harm and allows its attacks to flow around defenses, increasing Precision by ${tier.times(25)}% and inflicting Fatigue equal to ${tier.times(20)}% of maximum stamina on a hit.")
    }, ["choking", "precise"])),
    outcastStrength: validatedTrait(generateTrait({
        name: "Outcast's Strength",
        icon: "./icons/icons-1.png",
        enabled: true,
        description: _.template("Your bloody-minded refusal to allow your enemies to defeat you gives a ${tier.times(50)}% bonus to Health and a ${tier.times(25)}% bonus to Resilience.")
    }, ["robust", "tough"]))
}

export function generateTrait(baseObject, traits) {
    traits = traits || [];
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
                        value: _.get(srcValue, "value", 0) + _.get(objValue, "value", 0)
                    }
            }
        });
    }, baseObject));
}