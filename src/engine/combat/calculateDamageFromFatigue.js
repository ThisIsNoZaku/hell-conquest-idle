export default function calculateDamageFromFatigue(character) {
    return character.maximumHp.div(100).ceil();
}