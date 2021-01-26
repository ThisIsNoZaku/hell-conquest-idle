export default function calculateDamageFromFatigue(character) {
    return character.maximumHp.div(5).ceil(); // FIXME: Make divisor configurable.
}