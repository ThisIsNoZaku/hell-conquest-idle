export default function calculatedValue(baseValue) {
    const handler = {};
    return new Proxy({
        base: baseValue,
        modifiers: []
    }, handler)
}