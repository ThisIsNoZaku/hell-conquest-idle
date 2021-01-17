import Decimal from "decimal.js";
import {getConfigurationValue} from "../../config";

export default function calculateStaminaCostToFlee(player, enemy) {
    const baseCost = Decimal(getConfigurationValue("flee_stamina_cost_base"));
    const minimum = getConfigurationValue("flee_stamina_minimum_cost");
    return Decimal.max(minimum, baseCost.minus(enemy.powerLevel.minus(player.powerLevel)));
}