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
            "<p><strong>Cunning</strong> increases your Evasion, which lets your character reduce the severity of incoming attacks.</p>" +
            "<p><strong>Deceit</strong> increases your Precision, which leys your character increase the severity of their attacks.</p>" +
            "<p><strong>Madness</strong> increases the level of your Traits and Resilience, which reduces the damage from incoming attacks.</p>" +
            "<p>Spend your first starting points.</p>"
    },
    "tactics" : {
        title: "Tactics",
        body: "<p>Choose Tactics to specialize how your character approaches fights:</p>" +
            "<p><strong>Aggressive</strong> tactics overwhelm enemies with powerful attacks.</p>" +
            "<p><strong>Defensive</strong> tactics outlast enemies with superior defenses and stamina.</p>" +
            "<p><strong>Deceptive</strong> tactics turn the enemy's strength against them.</p>" +
            "<p>Aggressive tactics overpower Defensive tactics; Defensive tactics outlast Deceptive tactics; Deceptive tactics trip up Aggressive tactics.</p>" +
            "<p>Click the different buttons to see the details.</p>"
    },
    "reincarnation-demon-select" : {
        title: "Reincarnate Now",
        body: "<p>Click on one of the ??? squares to reincarnate as a random demon.</p>" +"<p> In the beginning, you won't have any demons unlocked so you'll have to start as a random one. You will unlock demons as you reincarnate.</p>",
    }
}