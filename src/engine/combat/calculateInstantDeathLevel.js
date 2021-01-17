import {getConfigurationValue} from "../../config";
import {Decimal} from "decimal.js";

export default function calculateInstantDeathLevel(player) {
    const instantDeathOffset = getConfigurationValue("instant_death_offset");
    return Decimal(player.highestLevelReached).minus(instantDeathOffset);
}