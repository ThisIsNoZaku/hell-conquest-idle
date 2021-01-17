export const HitTypes = {
    "-2": {
        type: "Miss",
        summary: "miss",
        damageMultiplier: 0,
        preventHit: true
    },
    "-1": {
        type: "Minor",
        summary: "minor",
        damageMultiplier: 0.5
    },
    0: {
        type: "Solid",
        summary: "solid",
        damageMultiplier: 1
    },
    1: {
        type: "Devastating",
        summary: "devastating",
        damageMultiplier: 1.5
    }
}

Object.defineProperty(HitTypes,"max", {
    value: Object.keys(HitTypes).reduce((max, next) => {
        return Math.max(max, Number.parseInt(next));
    }, 0)
});

Object.defineProperty(HitTypes,"min", {
    value: Object.keys(HitTypes).reduce((min, next) => {
        return Math.min(min, Number.parseInt(next));
    }, 0)
});