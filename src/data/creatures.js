export const Creatures  = {
    bloodthirstyKnight: {
        name: "Bloodthirsty Knight",
        traits: ["bloodrage"],
        appearance: "bloodthirstyKnight",
        texture: "01_warrior.png",
        description: "A ruthless warrior who delighted in slaughtering whoever they encounter on the battlefield."
    },
    rapaciousHighwayman: {
        name: "Rapacious Highwayman",
        traits: ["cupidity"],
        appearance: "rapaciousHighwayman",
        texture: "02_hunter.png",
        description: "A thief who stole from whomever he could get away with, from wealthy merchants to starving vagrants."
    },
    condemnedSlasher: {
        name: "Condemned Slasher",
        traits: ["murderousFrenzy"],
        appearance: "condemnedSlasher",
        texture: "03_rogue.png",
        description: "A madman who gained exquisite pleasure from seeing how many cuts could be made in a victim's body before they died."
    },
    crushingSnake: {
        name: "Crushing Snake",
        traits: ["inescapableGrasp"],
        appearance: "crushingSnake",
        texture: "06_snake_01.png",
        description: "A monstrous reptile which"
    },
    skitteringHorror: {
        name: "Skittering Horror",
        traits: ["terrifyingSkitter"],
        appearance: "skitteringHorror",
        texture: "10_spider.png"
    }
}

export function assertCreatureExists(id) {
    if(!Creatures[id]) {
        throw new Error(`No creature with id ${id} is defined`);
    }
}