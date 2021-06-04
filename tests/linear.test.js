for (let allTests = 0; allTests < 2; allTests++) {

    const gap = 300

    describe(allTests === 0 ? "without details" : "with details", () => {
        const cronosXp = require("../dist/index.js")

        const levelSystem = new cronosXp(process.env.mongoURL, {
            linear: true,
            xpGap: gap,
            returnDetails: allTests === 0 ? false : true
        });

        const ready = () => new Promise(setImmediate)

        const clear = async () => {
            await ready()
            return new Promise((resolve, reject) => {
                try {
                    levelSystem._model.collection.drop()
                    resolve(true)
                } catch (e) {
                    reject(e);
                }
            })
        }

        test("xpForLevel", () => {
            let levels = [0, 1, 2, 50, 51, 52, 90, 91, 92]
            levels.forEach((value) => {
                expect(levelSystem.xpForLevel(value)).toBe(value * gap)
            })
        })

        test("levelForXp", () => {
            let levels = [0, 1, 2, 50, 51, 52, 90, 91, 92]
            levels.forEach((value) => {
                expect(levelSystem.levelForXp(Math.random() * gap + value * gap)).toBe(value)
            })
        })

        test("xpForNext", () => {
            if (levelSystem._returnDetails === true) {
                let levels = [0, 1, 2, 50, 51, 52, 90, 91, 92]
                levels.forEach((value) => {
                    let xpOffset = Math.round(Math.random() * gap)
                    let inputXp = xpOffset + value * gap
                    expect(levelSystem.xpForNext(inputXp)).toStrictEqual({
                        xpNeeded: gap - xpOffset,
                        currentLevel: value,
                        nextLevel: value + 1,
                        currentLevelXp: value * gap,
                        nextLevelXp: (value + 1) * gap
                    })
                })
            } else {
                let levels = [0, 1, 2, 50, 51, 52, 90, 91, 92]
                levels.forEach((value) => {
                    let xpOffset = Math.round(Math.random() * gap)
                    expect(levelSystem.xpForNext(xpOffset + value * gap)).toBe(gap - xpOffset)
                })
            }
        })

        test("createGuild & isGuild", async () => {
            await clear()
            for (let i = 1; i < 7; i++) {
                expect(await levelSystem.createGuild(i)).toBe(true)
            }

            for (let i = 1; i < 7; i++) {
                expect(await levelSystem.isGuild(i)).toBe(true)
            }
        })

        test("createUser & isUser", async () => {
            for (let i = 1; i < 7; i++) {
                for (let n = 1; n < 10; n++) {
                    expect(await levelSystem.createUser(i, n)).toBe(true)
                }
            }

            for (let i = 1; i < 7; i++) {
                for (let n = 1; n < 10; n++) {
                    expect(await levelSystem.isUser(i, n)).toBe(true)
                }
            }
        })

        test("setXp", async () => {
            for (let n = 1; n < 10; n++) {
                expect(await levelSystem.setXp("1", n, Math.random() * gap * 100)).toBe(true)
            }
        })

        test("setXp For 5 & 6", async () => {
            for (let n = 1; n < 10; n++) {
                expect(await levelSystem.setXp("5", n, gap * 100)).toBe(true)
                expect(await levelSystem.setXp("6", n, gap * 100)).toBe(true)
            }
        })

        test("setLevel", async () => {
            for (let n = 1; n < 10; n++) {
                expect(await levelSystem.setLevel("2", n, Math.random() * 100)).toBe(true)
            }
        })

        test("addXp", async () => {
            for (let n = 1; n < 10; n++) {
                if (levelSystem._returnDetails === true) {
                    expect(await levelSystem.addXp("3", n, n * gap * 10)).toStrictEqual({
                        newLevel: n * 10,
                        newXp: gap * n * 10,
                        hasLevelUp: true,
                        details: {
                            xpDifference: gap * n * 10,
                            levelDifference: n * 10,
                            nextLevelXp: gap * n * 10 + gap,
                            currentLevelXp: gap * n * 10
                        }
                    })
                } else {
                    expect(await levelSystem.addXp("3", n, n * gap * 10)).toStrictEqual({
                        newLevel: n * 10,
                        newXp: gap * n * 10,
                        hasLevelUp: true
                    })
                }
            }
        })

        test("addLevel", async () => {
            for (let n = 1; n < 10; n++) {
                if (levelSystem._returnDetails === true) {
                    expect(await levelSystem.addLevel("4", n, n * 10)).toStrictEqual({
                        newLevel: n * 10,
                        newXp: gap * n * 10,
                        hasLevelUp: true,
                        details: {
                            xpDifference: gap * n * 10,
                            levelDifference: n * 10,
                            nextLevelXp: gap * n * 10 + gap,
                            currentLevelXp: gap * n * 10,
                        }
                    })
                } else {
                    expect(await levelSystem.addLevel("4", n, n * 10)).toStrictEqual({
                        newLevel: n * 10,
                        newXp: gap * n * 10,
                        hasLevelUp: true
                    })
                }
            }
        })

        test("subtractXp", async () => {
            if (levelSystem._returnDetails === true) {
                for (let n = 1; n < 10; n++) {
                    expect(await levelSystem.subtractXp("5", n, n * gap * 10)).toStrictEqual({
                        newLevel: 100 - n * 10,
                        newXp: gap * 100 - gap * 10 * n,
                        hasLevelDown: true,
                        details: {
                            xpDifference: -(n * 10 * gap),
                            levelDifference: -(n * 10),
                            nextLevelXp: (gap * 100 - gap * 10 * n) + gap,
                            currentLevelXp: gap * 100 - gap * 10 * n
                        }

                    })
                }
                expect(await levelSystem.subtractXp("5", "1", gap * 100)).toStrictEqual({
                    newLevel: 0,
                    newXp: 0,
                    hasLevelDown: true,
                    details: {
                        xpDifference: -(10 * 10 * gap),
                        levelDifference: -(9 * 10),
                        nextLevelXp: gap,
                        currentLevelXp: 0
                    }
                })
                expect(await levelSystem.setXp("5", "1", 9 * 10 * gap)).toBe(true)
            } else {
                for (let n = 1; n < 10; n++) {
                    expect(await levelSystem.subtractXp("5", n, n * gap * 10)).toStrictEqual({
                        newLevel: 100 - n * 10,
                        newXp: gap * 100 - gap * 10 * n,
                        hasLevelDown: true,
                    })
                }
                expect(await levelSystem.subtractXp("5", "1", gap * 100)).toStrictEqual({
                    newLevel: 0,
                    newXp: 0,
                    hasLevelDown: true
                })
                expect(await levelSystem.setXp("5", "1", 9 * 10 * gap)).toBe(true)
            }
        })

        test("subtractLevel", async () => {
            for (let n = 1; n < 10; n++) {
                if (levelSystem._returnDetails === true) {
                    expect(await levelSystem.subtractLevel("6", n, n * 10)).toStrictEqual({
                        newLevel: 100 - n * 10,
                        newXp: gap * 100 - gap * 10 * n,
                        hasLevelDown: true,
                        details: {
                            xpDifference: -(n * 10 * gap),
                            levelDifference: -(n * 10),
                            nextLevelXp: (gap * 100 - gap * 10 * n) + gap,
                            currentLevelXp: gap * 100 - gap * 10 * n
                        }

                    })
                } else {
                    expect(await levelSystem.subtractLevel("6", n, n * 10)).toStrictEqual({
                        newLevel: 100 - n * 10,
                        newXp: gap * 100 - gap * 10 * n,
                        hasLevelDown: true,
                    })
                }
            }
        })

        test("getUser", async () => {
            for (let n = 1; n < 10; n++) {
                expect(await levelSystem.getUser("5", n)).toStrictEqual({
                    xp: gap * 100 - n * 10 * gap,
                    level: 100 - n * 10
                })
            }
        })

        test("getGuild", async () => {
            for (let n = 1; n < 10; n++) {
                expect(await levelSystem.getGuild("6")).toHaveProperty(`${n}`)
            }
        })

        test("getLeaderboard", async () => {
            const leaderBoard = await levelSystem.getLeaderboard(4)
            for (let n = 0; n < 9; n++) {
                expect(leaderBoard[n][1].xp).toBe(gap * leaderBoard[n][1].level)
            }
        })

        test("resetUser", async () => {
            for (let n = 1; n < 10; n++) {
                expect(await levelSystem.resetUser("1", n)).toBe(true)
            }
        })

        test("deleteUser", async () => {
            for (let n = 1; n < 10; n++) {
                expect(await levelSystem.deleteUser("2", n)).toBe(true)
            }
        })

        test("resetUserGlobal", async () => {
            expect(await levelSystem.resetUserGlobal(3)).toBe(true)
        })

        test("deleteUserGlobal", async () => {
            expect(await levelSystem.deleteUserGlobal(7)).toBe(true)
        })

        test("resetGuild", async () => {
            expect(await levelSystem.resetGuild("3")).toBe(true)
        })

        test("deleteGuild", async () => {
            for (let i = 1; i < 7; i++) {
                expect(await levelSystem.deleteGuild(i)).toBe(true)
            }
        });
    })

    describe(`without startWithZero (static only) [${allTests === 0 ? "without details" : "with details"}]`, () => {
        const cronosXp = require("../dist/index.js");

        let levelSystem = new cronosXp(process.env.mongoURL, {
            linear: true,
            xpGap: gap,
            startWithZero: false,
            returnDetails: allTests === 0 ? false : true
        });

        test("xpForLevel", () => {
            let levels = [0, 1, 2, 50, 51, 52, 90, 91, 92];
            levels.forEach(value => {
                expect(levelSystem.xpForLevel(value)).toBe(value * gap - gap);
            })
        })

        test("levelForXp", () => {
            let levels = [0, 1, 2, 50, 51, 52, 90, 91, 92];
            levels.forEach((value) => {
                expect(levelSystem.levelForXp(Math.random() * gap + value * gap)).toBe(value + 1);
            })
        })

        test("xpForNext", () => {
            if (levelSystem._returnDetails === true) {
                let levels = [0, 1, 2, 50, 51, 52, 90, 91, 92];
                levels.forEach((value) => {
                    // value += 1
                    let xpOffset = Math.round(Math.random() * gap);
                    let inputXp = xpOffset + value * gap;
                    expect(levelSystem.xpForNext(inputXp)).toStrictEqual({
                        xpNeeded: gap - xpOffset,
                        currentLevel: value + 1,
                        nextLevel: value + 2,
                        currentLevelXp: value * gap,
                        nextLevelXp: value * gap + gap
                    });
                });
            } else {
                let levels = [0, 1, 2, 50, 51, 52, 90, 91, 92];
                levels.forEach((value) => {
                    let xpOffset = Math.round(Math.random() * gap);
                    expect(levelSystem.xpForNext(xpOffset + value * gap)).toBe(gap - xpOffset);
                });
            }
        });
    });
}