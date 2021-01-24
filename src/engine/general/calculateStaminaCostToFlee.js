import Decimal from "decimal.js";
import {getConfigurationValue} from "../../config";

export default function calculateStaminaCostToFlee(player, enemy) {
    const baseCost = Decimal(getConfigurationValue("flee_stamina_cost_base"))
            .times(Decimal.max(0, enemy.powerLevel.minus(player.powerLevel)))
        .times(Decimal(1).minus(Decimal(player.attributes["deceit"]).times(.05))); // FIXME: Move values into configuration
    return baseCost;
}