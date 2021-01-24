import Decimal from "decimal.js";
import {getConfigurationValue} from "../../config";

export default function calculateStaminaCostToFlee(player, enemy) {
    const baseCost = Decimal(getConfigurationValue("flee_stamina_cost_base"))
            .times(Decimal.max(0, enemy.powerLevel.minus(player.powerLevel)));
    return baseCost;
}