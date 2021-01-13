import {getConfigurationValue} from "./config";

export function debugMessage() {
    if(getConfigurationValue("debug")) {
        console.debug.apply(null, arguments);
    }
}