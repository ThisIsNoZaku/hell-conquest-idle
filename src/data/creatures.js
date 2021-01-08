export const Creatures  = {
    bloodthirstyKnight: {
        name: "Bloodthirsty Knight",
        traits: ["bloodrage"],
        enabled: true,
        appearance: "bloodthirstyKnight",
        texture: "01_warrior.png",
        description: "A ruthless warrior who delighted in slaughtering whoever they encounter on the battlefield.",
    },
    condemnedSlasher: {
        name: "Condemned Slasher",
        traits: ["sadisticJoy"],
        enabled: true,
        appearance: "condemnedSlasher",
        texture: "03_rogue.png",
        description: "A madman who gained exquisite pleasure from seeing how many cuts could be made in a victim's body before they died.",
    },
    crushingSnake: {
        name: "Crushing Snake",
        traits: ["inescapableGrasp"],
        enabled: true,
        appearance: "crushingSnake",
        texture: "06_snake_01.png",
        description: "A monstrous reptile which",
    },
    deadlyHornet: {
        name: "Deadly Hornet",
        traits: ["piercingStrike"],
        enabled: true,
        appearance: "deadlyHornet",
        texture: "12_wasp.png",
        description: "An insect whose stinger is able to pierce even metal protection."
    },
    rapaciousHighwayman: {
        name: "Rapacious Highwayman",
        traits: ["cupidity"],
        enabled: false,
        appearance: "rapaciousHighwayman",
        texture: "02_hunter.png",
        description: "A thief who stole from whomever he could get away with, from wealthy merchants to starving vagrants.",
    },
    searingFangViper: {
        name: "Searing-Fang Viper",
        traits: ["searingVenom"],
        enabled: true,
        appearance: "searingFangViper",
        texture: "07_snake_02.png",
        description: "A venomous snake, whose venom inflicts horrific agony to its victims."
    },
    skitteringHorror: {
        name: "Skittering Horror",
        traits: ["terrifyingSkitter"],
        enabled: true,
        appearance: "skitteringHorror",
        texture: "10_spider.png",
        description: "A massive spider that enjoys stalking its prey, frightening it by the sickening skittering of it's arachnid legs."
    },
    tormentedDead: {
        name: "Tormented Dead",
        traits: ["sharedPain"],
        enabled: true,
        appearance: "tormentedDead",
        texture: "29_zombie.png",
        description: "A human denied eternal rest and in agony from its ruined flesh."
    },
    wheezingApparition: {
        name: "Wheezing Apparition",
        traits: ["exhaustingTouch"],
        enabled: false,
        appearance: "wheezingApparition",
        texture: "128_sorrowsworn.png",
        description: "A soul of someone killed by strangulation, searching endlessly for victims upon which it can inflict the same fate."
    }
}

export const titles = {
    mad: {
        name: "Mad",
        attributeMultipliers: {
            brutality: 1,
            cunning: 1,
            deceit: 1,
            madness: 2
        }
    },
    savage: {
        name: "Brutal",
        attributeMultipliers: {
            brutality: 2,
            cunning: 1,
            deceit: 1,
            madness: 1
        }
    },
    devious: {
        name: "Devious",
        attributeMultipliers: {
            brutality: 1,
            cunning: 1,
            deceit: 2,
            madness: 1
        }
    },
    underhanded: {
        name: "Underhanded",
        attributeMultipliers: {
            brutality: 1,
            cunning: 1,
            deceit: 2,
            madness: 1
        }
    }
}

export function assertCreatureExists(id) {
    if(!Creatures[id]) {
        throw new Error(`No creature with id ${id} is defined`);
    }
}