import { config } from "../config";
import * as _ from "lodash";

export const Attributes = {
    brutality: {
        label: "Brutality",
            description: _.template(`Brutality is how savage and ruthless a Demon is. It adds to Power and Resilience.`),
            icon: "icons/icons-92.png"
    },
    cunning: {
        label: "Cunning",
            description: _.template("Cunning is how quick thinking a Demon is. It adds to Evasion."),
            icon: "icons/icons-24.png"
    },
    deceit: {
        label: "Deceit",
            description: _.template("Deceit is how underhanded and manipulative a Demon is. It adds to Precision."),
            icon: "icons/icons-17.png"
    },
    madness: {
        label: "Madness",
            description: _.template(`Madness is how disconnected from the limits of reality the Demon is. It gives a \${rank * ${ config.mechanics.combat.traitRank.effectPerPoint * 100}}% bonus to the effects of Traits.`),
            icon: "icons/icons-124.png"
    }
}