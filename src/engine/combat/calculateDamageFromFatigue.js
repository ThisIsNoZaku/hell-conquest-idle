export default function calculateDamageFromFatigue(character) {
    return character.maximumHp.div(5).ceil();
}