import {getGlobalState, saveGlobalState} from "./index";
import * as _ from "lodash";
import {Tutorials} from "../data/Tutorials";

let listeners = [];

export function enableTutorial(id) {
    const alreadyEnabled = _.get(getGlobalState(), ["tutorials", id, "enabled"]);
    _.set(getGlobalState(), ["tutorials", id, "enabled"], true);
    if(!alreadyEnabled) {
        listeners.forEach(l => {
            l("enabled", id, Tutorials[id])
        });
        saveGlobalState();
    }
}

export function completeTutorial(id) {
    const enabled = _.get(getGlobalState(), ["tutorials", id, "enabled"]);
    if(enabled) {
        const previouslyCompleted = _.get(getGlobalState(), ["tutorials", id, "completed"], false);
        _.set(getGlobalState(), ["tutorials", id, "completed"], true);
        if(!previouslyCompleted) {
            listeners.forEach(l => {
                l("completed", id, Tutorials[id])
            });
            if (Tutorials[id].onCompletion) {
                Tutorials[id].onCompletion();
            }
        }
        saveGlobalState();
    }
}

export function tutorialIsCompleted(id) {
    return _.get(getGlobalState(), ["tutorials", id, "completed"], false);
}

export function subscribeToTutorials(listener) {
    listeners.push(listener);
}

export function unsubscribeFromTutorials(listener) {
    listeners = listeners.filter(l => l !== listener);
}