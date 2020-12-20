const DefinedCreatures = {
    bloodthirstyKnight: {
        name: "Bloodthirsty Knight",
        traits: ["bloodrage"],
        appearance: "bloodthirstyKnight",
        texture: "01_warrior.png",
        description: "A ruthless warrior who delighted in slaughtering whoever they encounter on the battlefield."
    },
    rapaciousHighwayman: {
        name: "Rapacious Highwayman",
        enabled: false,
        traits: ["cupidity"],
        appearance: "rapaciousHighwayman",
        texture: "02_hunter.png",
        description: "A thief who stole from whomever he could get away with, from wealthy merchants to starving vagrants."
    },
    condemnedSlasher: {
        name: "Condemned Slasher",
        enabled: false,
        traits: ["murderousFrenzy"],
        appearance: "condemnedSlasher",
        texture: "03_rogue.png",
        description: "A madman who gained exquisite pleasure from seeing how many cuts he could perform before his victims died."
    },
    crushingSnake: {
        name: "Crushing Snake",
        traits: ["inescapableGrasp"],
        enabled: false,
        appearance: "crushingSnake",
        texture: "06_snake_01.png"
    },
    skitteringHorror: {
        name: "Skittering Horror",
        enabled: false,
        traits: ["terrifyingSkitter"],
        appearance: "skitteringHorror",
        texture: "10_spider.png"
    }
}

export const Creatures = Object.keys(DefinedCreatures).reduce((defined, next) => {
    if(DefinedCreatures[next].enabled !== false) {
        defined[next] = DefinedCreatures[next];
    }
    return defined;
}, {})

export function assertCreatureExists(id) {
    if(!Creatures[id]) {
        throw new Error(`No creature with id ${id} is defined`);
    }
}