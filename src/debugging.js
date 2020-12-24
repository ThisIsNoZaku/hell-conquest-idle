import {config} from "./config";

export function debugMessage() {
    if(config.debug) {
        console.debug.apply(null, arguments);
    }
}