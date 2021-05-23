"use strict";
const mongoose = require("mongoose");
const guildSchema = new mongoose.Schema({ _id: String, users: {} }, { versionKey: false });
class MissingArgumentException extends Error {
    constructor(message) {
        super();
        this.name = "MissingArgumentException";
        this.message = message;
    }
}
/**
 * TODO:
 *  - Either adding a few Properties to Interface "AddSubtractReturnObject" or a function to get amount of XP till next level
 *  - Test if everything works as its supposed to
 *  - Adding proper example.js file
 *  - Adding a readme.md explaining everything
 *  - Refactoring files etc and create an NPM package
 */
class LevelSystem {
    /**
     * @param {string} mongoUrl - The URL to the mongoDB
     * @param {options} [options] - An optional parameter for options
     */
    constructor(mongoUrl, options) {
        if (typeof options?.growthMultiplier !== "undefined") {
            if (typeof options?.growthMultiplier === "number") {
                this._growthMultiplier = Math.abs(options.growthMultiplier);
            }
            else {
                console.info("Invalid growthMultiplier input. Setting growthMultiplier to default (30)");
                this._growthMultiplier = 30;
            }
        }
        else {
            this._growthMultiplier = 30;
        }
        if (typeof options?.startWithZero !== "undefined") {
            if (typeof options?.startWithZero === "boolean") {
                this._startWithZero = options.startWithZero;
            }
            else {
                console.info("Invalid startWithZero input. Setting startWithZero to default (true)");
                this._startWithZero = true;
            }
        }
        else {
            this._startWithZero = true;
        }
        mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
            console.log("\x1b[32mSuccessfully connected to mongoDB\x1b[0m");
        }).catch((e) => {
            console.error(e);
        });
        this._model = mongoose.model("GuildXP", guildSchema, "GuildXP");
    }
    /**
     * Function that returns the amount of xp needed for a certain level
     * @param {number} targetLevel - The desired level
     * @returns {number} - Amount of xp needed for targetLevel
     * @throws {TypeError} - If the growthMultiplier isn't a number
     */
    xpForLevel(targetLevel) {
        if (typeof this._growthMultiplier === "number") {
            if (this._growthMultiplier === 0) {
                // level³ = xp
                let functionValue = Math.pow(targetLevel, 3);
                if (!this._startWithZero) {
                    // level³ - level = xp
                    functionValue = functionValue - targetLevel;
                }
                return Math.round(functionValue);
            }
            else {
                // growthMultiplier * level² = xp
                let functionValue = Math.abs(this._growthMultiplier) * Math.pow(targetLevel, 2);
                if (!this._startWithZero) {
                    // growthMultiplier * level² - growthMultiplier = xp
                    functionValue = functionValue - this._growthMultiplier;
                }
                return Math.round(functionValue);
            }
        }
        else {
            throw new TypeError("\"growthMultiplier\" has an invalid type. Expecting \"number\"");
        }
    }
    /**
     * Function that returns the level for a specific amount of xp
     * @param {number} targetXp - The desired xp
     * @returns {number} - The level at this amount of xp
     * @throws {TypeError} - If the growthMultiplier isn't a number
     */
    levelForXp(targetXp) {
        if (typeof this._growthMultiplier === "number") {
            if (this._growthMultiplier === 0) {
                // level = xp^1/3
                let functionValue;
                this._startWithZero ? functionValue = targetXp : functionValue = targetXp + this._growthMultiplier;
                return Math.floor(Math.pow(functionValue, 1 / 3));
            }
            else {
                // level = (xp / growthMultiplier)^1/2
                let functionValue;
                this._startWithZero ? functionValue = targetXp : functionValue = targetXp + this._growthMultiplier;
                return Math.floor(Math.pow(functionValue / Math.abs(this._growthMultiplier), 1 / 2));
            }
        }
        else {
            throw new TypeError("\"growthMultiplier\" has an invalid type. Expecting \"number\"");
        }
    }
    /**
     *
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of xp which the level and xp are set to
     * @returns {Promise<boolean>} - Returns true if the operation was successful
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    async setXp(guildId, userId, value) {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        }
        catch (e) {
            throw e;
        }
        return new Promise(((resolve, reject) => {
            this._model.updateOne({ "_id": guildId }, {
                $set: {
                    [`users.${userId}.level`]: this.levelForXp(value),
                    [`users.${userId}.xp`]: value
                }
            }, (e) => {
                if (e)
                    reject(e);
                resolve(true);
            });
        }));
    }
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The level which the level and xp are set to
     * @returns {Promise<boolean>} - Returns true if the operation was successful
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    async setLevel(guildId, userId, value) {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        }
        catch (e) {
            throw e;
        }
        return new Promise(((resolve, reject) => {
            this._model.updateOne({ "_id": guildId }, {
                $set: {
                    [`users.${userId}.level`]: value,
                    [`users.${userId}.xp`]: this.xpForLevel(value)
                }
            }, (e) => {
                if (e)
                    reject(e);
                resolve(true);
            });
        }));
    }
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of xp to add to that user
     * @returns {Promise<AddSubtractReturnObject>} - Returns an object with properties "newLevel", "newXp", "hasLevelUp"
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If the user couldn't be found or if there was a problem with the update operation
     */
    async addXp(guildId, userId, value) {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        }
        catch (e) {
            throw e;
        }
        let user = await this.getUser(guildId, userId);
        return new Promise(((resolve, reject) => {
            if (typeof user !== "boolean") {
                value = Math.floor(Math.abs(value));
                let newXp = user.xp + value;
                let newLevel = this.levelForXp(newXp);
                let levelDif = newLevel - user.level;
                let hasLevelUp = levelDif > 0;
                this._model.updateOne({ "_id": guildId }, {
                    $set: {
                        [`users.${userId}.level`]: newLevel,
                        [`users.${userId}.xp`]: newXp
                    }
                }, (e) => {
                    if (e)
                        reject(e);
                    resolve({
                        newLevel: newLevel,
                        newXp: newXp,
                        hasLevelUp: hasLevelUp
                    });
                });
            }
            else {
                throw Error("Target user couldn't be found in the database");
            }
        }));
    }
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of levels to add to that user
     * @returns {Promise<AddSubtractReturnObject>} - Returns an object with properties "newLevel", "newXp", "hasLevelUp"
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If the user couldn't be found or if there was a problem with the update operation
     */
    async addLevel(guildId, userId, value) {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        }
        catch (e) {
            throw e;
        }
        let user = await this.getUser(guildId, userId);
        return new Promise(((resolve, reject) => {
            if (typeof user !== "boolean") {
                value = Math.floor(Math.abs(value));
                let newLevel = user.level + value;
                let newXp = user.xp + this.xpForLevel(value - user.level);
                let hasLevelUp = value > 0;
                this._model.updateOne({ "_id": guildId }, {
                    $set: {
                        [`users.${userId}.level`]: newLevel,
                        [`users.${userId}.xp`]: newXp
                    }
                }, (e) => {
                    if (e)
                        reject(e);
                    resolve({
                        newLevel: newLevel,
                        newXp: newXp,
                        hasLevelUp: hasLevelUp
                    });
                });
            }
            else {
                throw Error("Target user couldn't be found in the database");
            }
        }));
    }
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of xp to remove from that user
     * @returns {Promise<AddSubtractReturnObject>} - Returns an object with properties "newLevel", "newXp", "hasLevelDown"
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If the user couldn't be found or if there was a problem with the update operation
     */
    async subtractXp(guildId, userId, value) {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        }
        catch (e) {
            throw e;
        }
        let user = await this.getUser(guildId, userId);
        return new Promise(((resolve, reject) => {
            if (typeof user !== "boolean") {
                let newXp = user.xp - value;
                if (newXp < 0)
                    newXp = 0;
                let newLevel = this.levelForXp(newXp);
                let levelDif = newLevel - user.level;
                let hasLevelDown = levelDif < 0;
                this._model.updateOne({ "_id": guildId }, {
                    $set: {
                        [`users.${userId}.level`]: newLevel,
                        [`users.${userId}.xp`]: newXp
                    }
                }, (e) => {
                    if (e)
                        reject(e);
                    resolve({
                        newLevel: newLevel,
                        newXp: newXp,
                        hasLevelDown: hasLevelDown
                    });
                });
            }
            else {
                throw Error("Target user couldn't be found in the database");
            }
        }));
    }
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of levels to remove from that user
     * @returns {Promise<AddSubtractReturnObject>} - Returns an object with properties "newLevel", "newXp", "hasLevelDown"
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If the user couldn't be found or if there was a problem with the update operation
     */
    async subtractLevel(guildId, userId, value) {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        }
        catch (e) {
            throw e;
        }
        let user = await this.getUser(guildId, userId);
        return new Promise(((resolve, reject) => {
            if (typeof user !== "boolean") {
                let newLevel = user.level - value;
                if (newLevel < 0)
                    newLevel = 0;
                let newXp = user.xp - (this.xpForLevel(user.level) - this.xpForLevel(newLevel));
                let levelDif = newLevel - user.level;
                let hasLevelDown = levelDif < 0;
                this._model.updateOne({ "_id": guildId }, {
                    $set: {
                        [`users.${userId}.level`]: newLevel,
                        [`users.${userId}.xp`]: newXp
                    }
                }, (e) => {
                    if (e)
                        reject(e);
                    resolve({
                        newLevel: newLevel,
                        newXp: newXp,
                        hasLevelDown: hasLevelDown
                    });
                });
            }
            else {
                throw Error("Target user couldn't be found in the database");
            }
        }));
    }
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {number} [limit = 10] - The amount of leaderboard entries to return
     * @returns {Promise<[string, unknown][] | boolean} - Returns an array of arrays that consist of the id as a string and "User" object
     * @example
     * //Returns:
     * [["id1", {xp: 0, level: 0}],["id2", {xp: 0, level: 0}]]
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    async getLeaderboard(guildId, limit) {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
        }
        catch (e) {
            throw e;
        }
        if (limit) {
            limit = Math.abs(limit);
        }
        else {
            limit = 10;
        }
        return new Promise(((resolve, reject) => {
            this._model.findOne({ "_id": guildId }).then((result) => {
                if (result === null)
                    resolve(false);
                let a = Object.entries(result.users);
                // @ts-ignore
                let b = a.sort((a, b) => b[1].xp - a[1].xp);
                let c = b.slice(0, limit);
                resolve(c);
            }).catch((e) => {
                reject(e);
            });
        }));
    }
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if user exists and false if he doesn't
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    async isUser(guildId, userId) {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        }
        catch (e) {
            throw e;
        }
        return new Promise(((resolve, reject) => {
            this._model.findOne({ "_id": guildId, [`users.${userId}`]: { $exists: true } }).then((result) => {
                if (result === null)
                    resolve(false);
                resolve(true);
            }).catch((e) => {
                reject(e);
            });
        }));
    }
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<Object | boolean>} - Returns the users data if he exists or false if he doesn't
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    async getUser(guildId, userId) {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        }
        catch (e) {
            throw e;
        }
        let isUser = await this.isUser(guildId, userId);
        return new Promise(((resolve, reject) => {
            if (!isUser)
                resolve(false);
            this._model.findOne({ "_id": guildId }, 
            //This can be commented if needed to take off the selecting load from MongoDB
            { "users": { [userId]: 1 } }
            //
            ).then((result) => {
                result.users[userId] ? resolve(result.users[userId]) : resolve(false);
            }).catch((e) => {
                reject(e);
            });
        }));
    }
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if the user was created
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there already is a user with this id in this guild or if there was a problem with the update operation
     */
    async createUser(guildId, userId) {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        }
        catch (e) {
            throw e;
        }
        const isUser = await this.isUser(guildId, userId);
        if (isUser)
            throw new Error("This guild already has a user with this id");
        return new Promise(((resolve, reject) => {
            this._model.updateOne({ "_id": guildId }, { $set: { [`users.${userId}`]: { "xp": 0, "level": 0 } } }, (e) => {
                if (e)
                    reject(e);
                resolve(true);
            });
        }));
    }
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if the user was deleted
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    async deleteUser(guildId, userId) {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        }
        catch (e) {
            throw e;
        }
        return new Promise(((resolve, reject) => {
            this._model.updateOne({ "_id": guildId }, { $unset: { [`users.${userId}`]: undefined } }, (e) => {
                if (e)
                    reject(e);
                resolve(true);
            });
        }));
    }
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if the user was reset
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    async resetUser(guildId, userId) {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
            userId = await LevelSystem._validateUserId(userId);
        }
        catch (e) {
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
    async isGuild(guildId) {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
        }
        catch (e) {
            throw e;
        }
        return new Promise(((resolve, reject) => {
            this._model.findOne({ "_id": guildId }).then((result) => {
                if (result === null)
                    resolve(false);
                resolve(true);
            }).catch((e) => {
                reject(e);
            });
        }));
    }
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {Promise<boolean | Object>} - Returns the guilds data if it exists or false if he doesn't
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    async getGuild(guildId) {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
        }
        catch (e) {
            throw e;
        }
        return new Promise(((resolve, reject) => {
            this._model.findOne({ "_id": guildId }).then((result) => {
                if (result === null)
                    resolve(false);
                resolve(result.users);
            }).catch((e) => {
                reject(e);
            });
        }));
    }
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {Promise<boolean>} - Returns true if the guild was created
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    async createGuild(guildId) {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
        }
        catch (e) {
            throw e;
        }
        let guild = new this._model({ "_id": guildId, "users": {} });
        return new Promise((resolve, reject) => {
            guild.save((e) => {
                if (e)
                    reject(e);
                resolve(true);
            });
        });
    }
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {Promise<boolean>} - Returns true if the guild was deleted
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    async deleteGuild(guildId) {
        try {
            guildId = await LevelSystem._validateGuildId(guildId);
        }
        catch (e) {
            throw e;
        }
        return new Promise(((resolve, reject) => {
            this._model.deleteOne({ "_id": guildId }).then(() => {
                // If you want to know if it actually got delete or if it already was deleted change the first line and add the second line
                // this._model.deleteOne({"_id": guildId}).then((result: any) => {
                // result.deletedCount === 0 ? resolve(false) : resolve(true)
                resolve(true);
            }).catch((e) => {
                reject(e);
            });
        }));
    }
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {string} - A valid guildId as a string
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     */
    static _validateGuildId(guildId) {
        if (!guildId)
            throw new MissingArgumentException("Missing parameter \"guildId\"");
        if (typeof guildId !== "string" && typeof guildId !== "number")
            throw new TypeError(`Expected type "string" or "number" for <guildId>, got "${typeof guildId}"`);
        if (typeof guildId === "number")
            return guildId.toString();
        return guildId;
    }
    /**
     * @param {(string | number)} userId - The id of the user
     * @returns {string} - A valid userId as a string
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     */
    static _validateUserId(userId) {
        if (!userId)
            throw new MissingArgumentException("Missing parameter \"guildId\"");
        if (typeof userId !== "string" && typeof userId !== "number")
            throw new TypeError(`Expected type "string" or "number" for <guildId>, got "${typeof userId}"`);
        if (typeof userId === "number")
            return userId.toString();
        return userId;
    }
}
module.exports = LevelSystem;
