import * as _ from "lodash";
import {getConfigurationValue} from "../config";

export const Attributes = {
    brutality: {
        label: "Brutality",
            description: _.template(`Brutality is how savage and ruthless a Demon is. It adds to Power and increases Health.`),
            icon: "icons/icons-92.png"
    },
    cunning: {
        label: "Cunning",
            description: _.template("Cunning is how quick thinking a Demon is. It adds to Evasion, helps hide your action from the enemy and increases energy gain per round."),
            icon: "icons/icons-24.png"
    },
    deceit: {
        label: "Deceit",
            description: _.template("Deceit is how underhanded and manipulative a Demon is. It adds to Precision and helps you figure out what action the enemy will perform."),
            icon: "icons/icons-17.png"
    },
    madness: {
        label: "Madness",
            description: _.template(`Madness is how disconnected from the limits of reality the Demon is. It adds to Resilience and increases the level of your Traits when high enough.`),
            icon: "icons/icons-124.png"
    }
}