import {getGlobalState} from "../index";

export default function cleanupDeadCharacters() {
    const deadCharacters = Object.keys(getGlobalState().characters)
        .filter(id => id !== '0' && !getGlobalState().currentEncounter.enemies.find(c => c.id == id));
    deadCharacters.forEach(id => {
        delete getGlobalState().characters[id]
    });
}