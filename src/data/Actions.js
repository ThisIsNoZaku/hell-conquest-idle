import React from "react";

export const Actions = {
    exploring: {
        id: "exploring",
        duration: "exploration.explorationTime",
        description: "Exploring..."
    },
    approaching: {
        id: "approaching",
        duration: "exploration.approachTime",
        description: "Approaching Enemy..."
    },
    dead: {
        id: "dead",
        duration: 100000000,
        description: "Rotting, time to reincarnate..."
    },
    looting: {
        id: "looting",
        duration: "exploration.lootingTime",
        description: "Looting the body..."
    },
    fleeing: {
        id: "fleeing",
        duration: "exploration.fleeingTime",
        description: "Fleeing in terror!"
    },
    fighting: {
        id: "fighting",
        duration: "exploration.combatTime",
        description: "In Combat!",
    },
    reincarnating: {
        id: "resurrecting",
        duration: "exploration.reincarnationTime",
        description: "Reincarnating..."
    },
    recovering: {
        id:"recovering",
        duration: "exploration.recoveryTime",
        description: "Healing..."
    },
    intimidating: {
        id:"intimidating",
        duration: "exploration.intimidateTime",
        description: "Intimidating..."
    }
}