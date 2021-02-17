import {enableTutorial} from "../engine/tutorials";

export const Tutorials = {
    intro: {
        title: "First Reincarnation",
        body: "<p>You are a damned soul, freshly condemned to Hell. Your goal: gain power, enough to conquer all of Hell!</p>" +
            "<p>Enslave weaker demons, usurp stronger ones and kill everyone else to grow in strength.</p>",
        onCompletion: () => {
            enableTutorial("reincarnation-attributes")
        }
    },
    "reincarnation-attributes" : {
        title: "Reincarnation Bonuses and Attributes",
        body: "<p>When you reincarnate into a new body, you can change how your points are spent to give yourself various bonuses.</p>" +
            "<p>Attributes are the base of your character and determine your combat statistics</p>" +
            "<p><strong>Brutality</strong> makes your attacks deal more damage and increases Health, making your character harder to kill.</p>" +
            "<p><strong>Cunning</strong> increases your Evasion, which lets your character avoid incoming attacks.</p>" +
            "<p><strong>Deceit</strong> increases your Precision, which lets your character increase the severity of their attacks.</p>" +
            "<p><strong>Madness</strong> increases your Resilience, which reduces the damage from incoming attacks. High levels additionally increase the Tiers of your traits.</p>" +
            "<p>Spend your first starting points to proceed.</p>"
    },
    "tactics" : {
        title: "Tactics",
        body: "<p>Choose Tactics to define how your character approaches fights:</p>" +
            "<p><strong>Overwhelming</strong> tactics make powerful, energy intensive attacks whenever possible.</p>" +
            "<p><strong>Attrition</strong> tactics make economical attacks to wear down the enemy, inflicting steady damage or exhausting the enemy's energy.</p>" +
            "<p><strong>Counter</strong> tactics husband strength, waiting for opportunities for strong attacks.</p>" +
            "<p><strong>No Defense</strong> tactics don't bother trying to avoid damage. All offense, all the time!</p>" +
            "<p><strong>Block</strong> tactics use small amounts of energy to reduce the damage of incoming attacks, while keeping enough strength to attack.</p>" +
            "<p><strong>Dodge</strong> tactics use up lots of energy, but completely negates attacks, good for fragile characters and against enemies that don't conserve their strength when attacking.</p>" +
            "<p>The combination of these two options determines how your character determines when to attack, when to defend and how it does both.</p>",
    },
    "reincarnation-demon-select" : {
        title: "Reincarnate Now",
        body: "<p>Click on one of the ??? squares to reincarnate as a random demon.</p>" +
            "<p>In the beginning, you won't have any demons unlocked so you'll have to start as a random one. You will be able to play as other kinds of demons after you defeat them in combat.</p>",
    },
    "exploring" : {
        title: "Exploration",
        body: "<p>While you're exploring you can</p>" +
            "<p><strong>Hunt</strong> weaker demons to easily accumulate small amounts of power. Weaker demons can also be Intimidated to bind them to you, strengthening your Attributes.</p>" +
            "<p><strong>Challenge</strong> demons of the same level to strengthen yourself.</p>" +
            "<p><strong>Usurp</strong> a stronger demon, which grants far greater power than weaker demons.</p>"
    },
    "leveling-up": {
        title: "Leveling Up and Reincarnation",
        body: "<p>As you kill other demons, your own power grows.</p>" +
            "<p>When you absorb enough power from other demons your level increases; eventually however, you will find that your current physical form is simply not powerful enough to defeat your enemies.</p>" +
            "<p>When this occurs, you should Reincarnate, selecting a new body, strengthened by the spiritual energy you've absorbed.</p>" +
            "<p>When you reincarnate, you can spend some of your bonus points to also gain Traits from demon you had previously reincarnated as, in addition to the innate one of your new form..</p>"
    },
    "energy-burn" : {
        title: "Energy Burn",
        body: "<p>When a character generates too much energy during battle, they suffer a phenomenon called Energy Burn.</p>" +
            "<p>In the same way that mortal creatures will consume their own fat and muscle when starving, Demons will burn their physical forms back into energy to use in battle.</p>" +
            "<p>Don't</p>"
    }
}