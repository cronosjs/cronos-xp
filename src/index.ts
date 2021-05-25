const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({_id: String, users: {}}, {versionKey: false});

/**
 * A custom error for a missing argument
 */
class MissingArgumentException extends Error {
    constructor(message: string) {
        super();
        this.name = "MissingArgumentException";
        this.message = message;
    }
}

/**
 * @property {number} [growthMultiplier = 30]
 * @property {boolean} [startWithZero = true]
 * @property {boolean} [returnDetails = false]
 * @example
 * // growthMultiplier = 0 means x³ and not 0 * x²
 * const DefaultValues = {
 *     growthMultiplier = 30,
 *     startWithZero = true
 *     returnDetails = true
 * }
 */
interface ConstructorOptions {
    growthMultiplier?: number,
    startWithZero?: boolean,
    returnDetails?: boolean
}

/**
 * @property {number} xp
 * @property {number} level
 */
interface User {
    xp: number,
    level: number
}

/**
 * @property {number} xpDifference
 * @property {number} levelDifference
 * @property {number} nextLevelXp
 * @property {number} currentLevelXp
 */
interface Details {
    xpDifference: number,
    levelDifference: number,
    nextLevelXp: number,
    currentLevelXp: number
}

/**
 * @property {number} newLevel
 * @property {number} newXp
 * @property {number} [hasLevelUp]
 * @property {number} [hasLevelDown]
 * @property {Details} [details]
 */
interface AddSubtractReturnObject {
    newLevel: number,
    newXp: number,
    hasLevelUp?: boolean,
    hasLevelDown?: boolean,
    details?: Details
}

/**
 * @property {number} xpNeeded
 * @property {number} currentLevel
 * @property {number} nextLevel
 * @property {number} currentLevelXp
 * @property {number} nextLevelXp
 */
interface XpForNextReturnObject {
    xpNeeded: number,
    currentLevel: number,
    nextLevel: number,
    currentLevelXp: number,
    nextLevelXp: number
}

/**
 * A LevelSystem class that works with a mongoDB and allows for quite some flexibility.
 *
 * See the {@link https://github.com/elttayman-Co/cronos-xp#readme readme}
 */
class LevelSystem {
    private readonly _model: any;
    private readonly _growthMultiplier: number;
    private readonly _startWithZero: boolean;
    private readonly _returnDetails: boolean;

    /**
     * @param {string} mongoUrl - The URL to the mongoDB
     * @param {ConstructorOptions} [options] - A parameter for options
     */
    constructor(mongoUrl: string, options?: ConstructorOptions) {
        if (typeof options?.growthMultiplier !== "undefined") {
            if (typeof options?.growthMultiplier === "number") {
                this._growthMultiplier = Math.abs(options.growthMultiplier);
            } else {
                console.info("Invalid growthMultiplier input. Setting growthMultiplier to default (30)");
                this._growthMultiplier = 30;
            }
        } else {
            this._growthMultiplier = 30;
        }

        if (typeof options?.startWithZero !== "undefined") {
            if (typeof options?.startWithZero === "boolean") {
                this._startWithZero = options.startWithZero;
            } else {
                console.info("Invalid startWithZero input. Setting startWithZero to default (true)");
                this._startWithZero = true;
            }
        } else {
            this._startWithZero = true;
        }

        if (typeof options?.returnDetails !== "undefined") {
            if (typeof options?.returnDetails === "boolean") {
                this._returnDetails = options.returnDetails;
            } else {
                console.info("Invalid startWithZero input. Setting startWithZero to default (false)");
                this._returnDetails = false;
            }
        } else {
            this._returnDetails = false;
        }

        mongoose.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
            console.log("\x1b[32mSuccessfully connected to mongoDB\x1b[0m")
        }).catch((e: Error) => {
            console.error(e)
        });

        this._model = mongoose.model("GuildXP", guildSchema, "GuildXP");
    }

    /**
     * Function that returns the amount of xp needed for a certain level
     * @param {number} targetLevel - The desired level
     * @returns {number} - Amount of xp needed for targetLevel
     */
    public xpForLevel(targetLevel: number): number {
        if (this._growthMultiplier === 0) {
            // level³ = xp
            let functionValue = Math.pow(targetLevel, 3);
            if (!this._startWithZero) {
                // level³ - level = xp
                functionValue = functionValue - targetLevel;
            }
            return Math.round(functionValue);
        } else {
            // growthMultiplier * level² = xp
            let functionValue = Math.abs(this._growthMultiplier) * Math.pow(targetLevel, 2);
            if (!this._startWithZero) {
                // growthMultiplier * level² - growthMultiplier = xp
                functionValue = functionValue - this._growthMultiplier;
            }
            return Math.round(functionValue);
        }
    }

    /**
     * Function that returns the level for a specific amount of xp
     * @param {number} targetXp - The desired xp
     * @returns {number} - The level at this amount of xp
     */
    public levelForXp(targetXp: number): number {
        if (this._growthMultiplier === 0) {
            // level = xp^1/3
            let functionValue;
            this._startWithZero ? functionValue = targetXp : functionValue = targetXp + this._growthMultiplier;
            return Math.floor(Math.pow(functionValue, 1 / 3));
        } else {
            // level = (xp / growthMultiplier)^1/2
            let functionValue;
            this._startWithZero ? functionValue = targetXp : functionValue = targetXp + this._growthMultiplier;
            return Math.floor(Math.pow(functionValue / Math.abs(this._growthMultiplier), 1 / 2));
        }
    }

    /**
     * Function that returns the amount of xp needed to reach the next level
     * @param {number} currentXp - The current xp on which the calculations for the next level are based on
     * @returns {(number | XpForNextReturnObject)} - The amount of xp needed or the current and next level as well as their min required XP
     */
    public xpForNext(currentXp: number): number | XpForNextReturnObject{
        let currentLevel = this.levelForXp(currentXp)
        let currentLevelXp = this.xpForLevel(currentLevel)
        let nextLevel = currentLevel + 1
        let nextLevelXp = this.xpForLevel(nextLevel)
        if(!this._returnDetails){
            return nextLevelXp - currentXp
        } else {
            return {
                xpNeeded: nextLevelXp - currentXp,
                currentLevel: currentLevel,
                nextLevel: nextLevel,
                currentLevelXp: currentLevelXp,
                nextLevelXp: nextLevelXp
            }
        }
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of xp which the level and xp are set to
     * @returns {Promise<boolean>} - Returns true if the operation was successful
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If the guild or user doesn't exist or if there was a problem with the update operation
     */
    public async setXp(guildId: string | number, userId: string | number, value: number): Promise<boolean> {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        } catch (e) {
            throw e;
        }

        let isUser = await this.isUser(guildId, userId)
        if(!isUser) throw new Error("This guildId or userId does not exist");

        return new Promise(((resolve, reject) => {
            this._model.updateOne(
                {"_id": guildId},
                {
                    $set: {
                        [`users.${userId}.level`]: this.levelForXp(value),
                        [`users.${userId}.xp`]: value
                    }
                },
                (e: Error) => {
                    if (e) reject(e);
                    resolve(true);
                }
            )
        }))
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The level which the level and xp are set to
     * @returns {Promise<boolean>} - Returns true if the operation was successful
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If the guild or user doesn't exist or if there was a problem with the update operation
     */
    public async setLevel(guildId: string | number, userId: string | number, value: number): Promise<boolean> {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        } catch (e) {
            throw e;
        }

        let isUser = await this.isUser(guildId, userId)
        if(!isUser) throw new Error("This guildId or userId does not exist");

        return new Promise(((resolve, reject) => {
            this._model.updateOne(
                {"_id": guildId},
                {
                    $set: {
                        [`users.${userId}.level`]: value,
                        [`users.${userId}.xp`]: this.xpForLevel(value)
                    }
                },
                (e: Error) => {
                    if (e) reject(e);
                    resolve(true);
                }
            )
        }))
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of xp to add to that user
     * @returns {Promise<AddSubtractReturnObject>} - Returns an object of type "AddSubtractReturnObject"
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If the user couldn't be found or if there was a problem with the update operation
     */
    public async addXp(guildId: string | number, userId: string | number, value: number): Promise<AddSubtractReturnObject> {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        } catch (e) {
            throw e;
        }

        let user = await this.getUser(guildId, userId);
        return new Promise(((resolve, reject) => {
            if (typeof user !== "boolean") {
                value = Math.floor(Math.abs(value));
                let newXp: number = user.xp + value;
                let newLevel: number = this.levelForXp(newXp);
                let levelDif: number = newLevel - user.level;
                let hasLevelUp: boolean = levelDif > 0;
                this._model.updateOne(
                    {"_id": guildId},
                    {
                        $set: {
                            [`users.${userId}.level`]: newLevel,
                            [`users.${userId}.xp`]: newXp
                        }
                    },
                    (e: Error) => {
                        if (e) reject(e);
                        let result: AddSubtractReturnObject = {
                            newLevel: newLevel,
                            newXp: newXp,
                            hasLevelUp: hasLevelUp,
                        }
                        if (this._returnDetails) {
                            result.details = {
                                xpDifference: value,
                                levelDifference: levelDif,
                                nextLevelXp: this.xpForLevel(newLevel + 1),
                                currentLevelXp: this.xpForLevel(newLevel)
                            }
                        }
                        resolve(result);
                    }
                )
            } else {
                throw Error("Target user couldn't be found in the database");
            }
        }))
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of levels to add to that user
     * @returns {Promise<AddSubtractReturnObject>} - Returns an object of type "AddSubtractReturnObject"
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If the user couldn't be found or if there was a problem with the update operation
     */
    public async addLevel(guildId: string | number, userId: string | number, value: number): Promise<AddSubtractReturnObject> {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        } catch (e) {
            throw e;
        }

        let user = await this.getUser(guildId, userId);
        return new Promise(((resolve, reject) => {
            if (typeof user !== "boolean") {
                value = Math.floor(Math.abs(value));
                let newLevel: number = user.level + value;
                let xpDif: number = this.xpForLevel(newLevel) - this.xpForLevel(user.level);
                let newXp: number = user.xp + xpDif;
                let hasLevelUp: boolean = value > 0;
                this._model.updateOne(
                    {"_id": guildId},
                    {
                        $set: {
                            [`users.${userId}.level`]: newLevel,
                            [`users.${userId}.xp`]: newXp
                        }
                    },
                    (e: Error) => {
                        if (e) reject(e);
                        let result: AddSubtractReturnObject = {
                            newLevel: newLevel,
                            newXp: newXp,
                            hasLevelUp: hasLevelUp,
                        }
                        if (this._returnDetails) {
                            result.details = {
                                xpDifference: xpDif,
                                levelDifference: value,
                                nextLevelXp: this.xpForLevel(newLevel + 1),
                                currentLevelXp: this.xpForLevel(newLevel)
                            }
                        }
                        resolve(result);
                    }
                )
            } else {
                throw Error("Target user couldn't be found in the database");
            }
        }))
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of xp to remove from that user
     * @returns {Promise<AddSubtractReturnObject>} - Returns an object of type "AddSubtractReturnObject"
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If the user couldn't be found or if there was a problem with the update operation
     */
    public async subtractXp(guildId: string | number, userId: string | number, value: number): Promise<AddSubtractReturnObject> {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        } catch (e) {
            throw e;
        }

        let user = await this.getUser(guildId, userId);
        return new Promise(((resolve, reject) => {
            if (typeof user !== "boolean") {
                let newXp: number = user.xp - value;
                if (newXp < 0) newXp = 0;
                let newLevel: number = this.levelForXp(newXp);
                let levelDif: number = newLevel - user.level;
                let hasLevelDown: boolean = levelDif < 0;
                this._model.updateOne(
                    {"_id": guildId},
                    {
                        $set: {
                            [`users.${userId}.level`]: newLevel,
                            [`users.${userId}.xp`]: newXp
                        }
                    },
                    (e: Error) => {
                        if (e) reject(e);
                        let result: AddSubtractReturnObject = {
                            newLevel: newLevel,
                            newXp: newXp,
                            hasLevelDown: hasLevelDown,
                        }
                        if (this._returnDetails) {
                            result.details = {
                                xpDifference: -value,
                                levelDifference: levelDif,
                                nextLevelXp: this.xpForLevel(newLevel + 1),
                                currentLevelXp: this.xpForLevel(newLevel)
                            }
                        }
                        resolve(result);
                    }
                )
            } else {
                throw Error("Target user couldn't be found in the database");
            }
        }))
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of levels to remove from that user
     * @returns {Promise<AddSubtractReturnObject>} - Returns an object of type "AddSubtractReturnObject"
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If the user couldn't be found or if there was a problem with the update operation
     */
    public async subtractLevel(guildId: string | number, userId: string | number, value: number): Promise<AddSubtractReturnObject> {
        try {
            guildId = await LevelSystem._validateGuildId(guildId)
            userId = await LevelSystem._validateUserId(userId)
        } catch (e) {
            throw e
        }

        let user = await this.getUser(guildId, userId);
        return new Promise(((resolve, reject) => {
            if (typeof user !== "boolean") {
                let newLevel: number = user.level - value;
                if (newLevel < 0) newLevel = 0;
                let userLevel = user.level;
                let xpDif = (this.xpForLevel(user.level) - this.xpForLevel(newLevel));
                let newXp = user.xp - xpDif;
                let hasLevelDown: boolean = value > 0;

                this._model.updateOne(
                    {"_id": guildId},
                    {
                        $set: {
                            [`users.${userId}.level`]: newLevel,
                            [`users.${userId}.xp`]: newXp
                        }
                    },
                    (e: Error) => {
                        if (e) reject(e);
                        let result: AddSubtractReturnObject = {
                            newLevel: newLevel,
                            newXp: newXp,
                            hasLevelDown: hasLevelDown,
                        }
                        if (this._returnDetails) {
                            result.details = {
                                xpDifference: xpDif === 0 ? xpDif : -xpDif,
                                levelDifference: newLevel <= 0 ? -value - (userLevel - value) : -value,
                                nextLevelXp: this.xpForLevel(newLevel + 1),
                                currentLevelXp: this.xpForLevel(newLevel)
                            }
                        }
                        resolve(result);
                    }
                )
            } else {
                throw Error("Target user couldn't be found in the database");
            }
        }))
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {number} [limit = 10] - The amount of leaderboard entries to return
     * @param {number} [startingAt = 0] - At which place to start (0 = start from first, 2 = start from third, ...)
     * @returns {Promise<[string, User][]> | boolean} - Returns an array of arrays that consist of the id as a string and "User" object
     * @example
     * //Returns:
     * [["id1", {xp: 0, level: 0}], ["id2", {xp: 0, level: 0}], ...]
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    public async getLeaderboard(guildId: string | number, limit?: number, startingAt?: number): Promise<[string, User][] | boolean> {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
        } catch (e) {
            throw e;
        }

        const l = limit ? Math.abs(limit) : 10;

        const sa = startingAt ? Math.abs(startingAt) : 0;

        return new Promise(((resolve, reject) => {
            startingAt ? startingAt = Math.abs(startingAt) : startingAt = 0;
            this._model.findOne({"_id": guildId}).then((result: any) => {
                if (result === null) resolve(false);
                let a: [string, User][] = Object.entries(result.users);
                let b = a.sort((a: [string, User], b: [string, User]) => b[1].xp - a[1].xp);
                let c = b.slice(sa, sa + l);
                resolve(c);
            }).catch((e: Error) => {
                reject(e);
            })
        }))
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if user exists and false if he doesn't
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    public async isUser(guildId: string | number, userId: string | number): Promise<boolean> {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        } catch (e) {
            throw e;
        }

        return new Promise(((resolve, reject) => {
            this._model.findOne({"_id": guildId, [`users.${userId}`]: {$exists: true}}).then((result: any) => {
                if (result === null) resolve(false);
                resolve(true);
            }).catch((e: Error) => {
                reject(e);
            })
        }))
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<User | boolean>} - Returns the users data if he exists or false if he doesn't
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    public async getUser(guildId: string | number, userId: string | number): Promise<User | boolean> {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        } catch (e) {
            throw e;
        }

        let isUser = await this.isUser(guildId, userId);

        return new Promise(((resolve, reject) => {
            if (!isUser) resolve(false);
            this._model.findOne(
                {"_id": guildId},
                //This can be commented if needed to take off the selecting load from MongoDB
                {"users": {[userId]: 1}}
                //
            ).then((result: any) => {
                result.users[userId] ? resolve(result.users[userId]) : resolve(false);
            }).catch((e: Error) => {
                reject(e);
            })
        }))
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if the user was created
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there already is a user with this id in this guild or if there was a problem with the update operation
     */
    public async createUser(guildId: string | number, userId: string | number): Promise<boolean> {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        } catch (e) {
            throw e;
        }

        const isUser = await this.isUser(guildId, userId);
        if (isUser) throw new Error("This guild already has a user with this id");

        return new Promise(((resolve, reject) => {
            this._model.updateOne(
                {"_id": guildId},
                {$set: {[`users.${userId}`]: {"xp": 0, "level": 0}}},
                (e: Error) => {
                    if (e) reject(e);
                    resolve(true);
                }
            )
        }))
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if the user was deleted
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    public async deleteUser(guildId: string | number, userId: string | number): Promise<boolean> {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        } catch (e) {
            throw e;
        }

        return new Promise(((resolve, reject) => {
            this._model.updateOne(
                {"_id": guildId},
                {$unset: {[`users.${userId}`]: undefined}},
                (e: Error) => {
                    if (e) reject(e);
                    resolve(true);
                }
            )
        }))
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if the user was reset
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    public async resetUser(guildId: string | number, userId: string | number): Promise<boolean> {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        } catch (e) {
            throw e;
        }

        return this.setXp(guildId, userId, 0);
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {Promise<boolean>} - Returns true if guild exists and false if it doesn't
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    public async isGuild(guildId: string | number): Promise<boolean> {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
        } catch (e) {
            throw e;
        }

        return new Promise(((resolve, reject) => {
            this._model.findOne({"_id": guildId}).then((result: any) => {
                if (result === null) resolve(false);
                resolve(true);
            }).catch((e: Error) => {
                reject(e);
            })
        }))
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {Promise<boolean | object>} - Returns the guilds data if it exists or false if he doesn't
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    public async getGuild(guildId: string | number): Promise<boolean | object> {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
        } catch (e) {
            throw e;
        }

        return new Promise(((resolve, reject) => {
            this._model.findOne({"_id": guildId}).then((result: any) => {
                if (result === null) resolve(false);
                resolve(result.users);
            }).catch((e: Error) => {
                reject(e);
            })
        }))
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {Promise<boolean>} - Returns true if the guild was created and false if it already exists
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    public async createGuild(guildId: string | number): Promise<boolean> {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
        } catch (e) {
            throw e;
        }

        const isGuild = await this.isGuild(guildId);
        if (isGuild) throw new Error("This guild already exists");

        let guild = new this._model({"_id": guildId, "users": {}});
        return new Promise((resolve, reject) => {
            guild.save((e: Error) => {
                if (e) reject(e);
                resolve(true);
            })
        })
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {Promise<boolean>} - Returns true if the guild was deleted
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    public async deleteGuild(guildId: string | number): Promise<boolean> {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
        } catch (e) {
            throw e;
        }

        return new Promise(((resolve, reject) => {
            this._model.deleteOne({"_id": guildId}).then(() => {
                // If you want to know if it actually got delete or if it already was deleted change the first line and add the second line
                // this._model.deleteOne({"_id": guildId}).then((result: any) => {
                // result.deletedCount === 0 ? resolve(false) : resolve(true)
                resolve(true);
            }).catch((e: Error) => {
                reject(e);
            })
        }))
    }

    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {string} - A valid guildId as a string
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     */
    private static _validateGuildId(guildId: string | number): string {
        if (!guildId) throw new MissingArgumentException("Missing parameter \"guildId\"");
        if (typeof guildId === "string") return guildId;
        return guildId.toString();
    }

    /**
     * @param {(string | number)} userId - The id of the user
     * @returns {string} - A valid userId as a string
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     */
    private static _validateUserId(userId: string | number): string {
        if (!userId) throw new MissingArgumentException("Missing parameter \"guildId\"");
        if (typeof userId === "string") return userId;
        return userId.toString();
    }
}

export = LevelSystem;