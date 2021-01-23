export default function calculateDamageFromFatigue(character) {
    return character.maximumHp.div(10).ceil(); // FIXME: Make divisor configurable.
}