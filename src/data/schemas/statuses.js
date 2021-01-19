import JOI from "joi";
import {modifierEffects} from "./effects";

export default function validatedStatus(object) {
    const validation = statusSchema.validate(object);
    if(validation.error) {
        throw new Error(validation.error);
    }
    return validation.value;
}

const statusSchema = JOI.object({
    name: JOI.string().required(),
    icon: JOI.string().required(),
    description: JOI.function().required(),
    effects: modifierEffects
})