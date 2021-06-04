const cronosXp = require("../dist/index.js")

let levelSystem = new cronosXp(process.env.mongoURL, {
    linear: true,
    xpGap: 500,
    startWithZero: false,
    returnDetails: true
});

const ready = () => new Promise(setImmediate)

test("xpForLevel", () => {
    expect(levelSystem.xpForLevel(0)).toBe(-500)
    expect(levelSystem.xpForLevel(1)).toBe(0)
    expect(levelSystem.xpForLevel(2)).toBe(500)
    expect(levelSystem.xpForLevel(50)).toBe(24500)
    expect(levelSystem.xpForLevel(51)).toBe(25000)
    expect(levelSystem.xpForLevel(52)).toBe(25500)
    expect(levelSystem.xpForLevel(90)).toBe(44500)
    expect(levelSystem.xpForLevel(91)).toBe(45000)
    expect(levelSystem.xpForLevel(92)).toBe(45500)
})

test("levelForXp", () => {
    expect(levelSystem.levelForXp(0)).toBe(1)
    expect(levelSystem.levelForXp(499)).toBe(1)
    expect(levelSystem.levelForXp(999)).toBe(2)
    expect(levelSystem.levelForXp(1350)).toBe(3)
    expect(levelSystem.levelForXp(25275)).toBe(51)
    expect(levelSystem.levelForXp(25789)).toBe(52)
    expect(levelSystem.levelForXp(26499)).toBe(53)
    expect(levelSystem.levelForXp(45321)).toBe(91)
    expect(levelSystem.levelForXp(45725)).toBe(92)
    expect(levelSystem.levelForXp(46499)).toBe(93)
})

test("xpForNext", () => {
    if (levelSystem._returnDetails === true) {
        expect(levelSystem.xpForNext(0)).toStrictEqual({
            xpNeeded: 500,
            currentLevel: 1,
            nextLevel: 2,
            currentLevelXp: 0,
            nextLevelXp: 500
        })
        expect(levelSystem.xpForNext(499)).toStrictEqual({
            xpNeeded: 1,
            currentLevel: 1,
            nextLevel: 2,
            currentLevelXp: 0,
            nextLevelXp: 500
        })
        expect(levelSystem.xpForNext(999)).toStrictEqual({
            xpNeeded: 1,
            currentLevel: 2,
            nextLevel: 3,
            currentLevelXp: 500,
            nextLevelXp: 1000
        })
        expect(levelSystem.xpForNext(1350)).toStrictEqual({
            xpNeeded: 150,
            currentLevel: 3,
            nextLevel: 4,
            currentLevelXp: 1000,
            nextLevelXp: 1500
        })
        expect(levelSystem.xpForNext(25275)).toStrictEqual({
            xpNeeded: 225,
            currentLevel: 51,
            nextLevel: 52,
            currentLevelXp: 25000,
            nextLevelXp: 25500
        })
        expect(levelSystem.xpForNext(25789)).toStrictEqual({
            xpNeeded: 211,
            currentLevel: 52,
            nextLevel: 53,
            currentLevelXp: 25500,
            nextLevelXp: 26000
        })
        expect(levelSystem.xpForNext(26499)).toStrictEqual({
            xpNeeded: 1,
            currentLevel: 53,
            nextLevel: 54,
            currentLevelXp: 26000,
            nextLevelXp: 26500
        })
        expect(levelSystem.xpForNext(45321)).toStrictEqual({
            xpNeeded: 179,
            currentLevel: 91,
            nextLevel: 92,
            currentLevelXp: 45000,
            nextLevelXp: 45500
        })
        expect(levelSystem.xpForNext(45725)).toStrictEqual({
            xpNeeded: 275,
            currentLevel: 92,
            nextLevel: 93,
            currentLevelXp: 45500,
            nextLevelXp: 46000
        })
        expect(levelSystem.xpForNext(46499)).toStrictEqual({
            xpNeeded: 1,
            currentLevel: 93,
            nextLevel: 94,
            currentLevelXp: 46000,
            nextLevelXp: 46500
        })
    } else {
        expect(levelSystem.xpForNext(499)).toBe(1)
        expect(levelSystem.xpForNext(999)).toBe(1)
        expect(levelSystem.xpForNext(1350)).toBe(150)
        expect(levelSystem.xpForNext(25275)).toBe(225)
        expect(levelSystem.xpForNext(25789)).toBe(211)
        expect(levelSystem.xpForNext(26499)).toBe(1)
        expect(levelSystem.xpForNext(45321)).toBe(179)
        expect(levelSystem.xpForNext(45725)).toBe(275)
        expect(levelSystem.xpForNext(46499)).toBe(1)
    }
})