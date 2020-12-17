import {config} from "./config";

export function debugMessage() {
    if(config.debug) {
        console.trace.apply(null, arguments);
    }
}