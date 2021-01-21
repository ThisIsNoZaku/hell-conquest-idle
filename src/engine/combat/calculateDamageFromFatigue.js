export default function calculateDamageFromFatigue(character) {
    return character.maximumHp.div(20).ceil();
}