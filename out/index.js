"use strict";
const mongoose = require("mongoose");
const guildSchema = new mongoose.Schema({
    _id: String,
    users: {}
}, { versionKey: false });
/**
 * General
 * ToDo-List:
 *  - Think of a system for how levels and xp are connected
 *  - Add isUser()
 *  - Add isGuild()
 *  - Add setLevel() | setXp() [Or hybrid via Object]
 *  - Add addLevel() | addXp() [Or hybrid via Object]
 *  - Add subLevel() | subXp() [Or hybrid via Object]
 *  - Add getLeaderboard()
 */
class LevelSystem {
    /**
     * @param {string} mongoUrl - The URL to the MongoDB
     */
    constructor(mongoUrl) {
        this._model = null;
        mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        this._model = mongoose.model("GuildXP", guildSchema, "GuildXP");
    }
    /**
     * @param {string} guildId - The ID of the Guild
     * @param {string} userId - The ID of the User
     *
     * @return {Promise<Object | boolean>} - Returns the users data if he exists or false if he doesn't
     */
    async getUser(guildId, userId) {
        if (typeof guildId === "number")
            guildId = guildId.toString();
        if (typeof userId === "number")
            userId = userId.toString();
        return new Promise(((resolve, reject) => {
            this._model.findOne({ "_id": guildId }, { "users": { [userId]: 1 } }).then((result) => {
                result.users[userId] ? resolve(result.users[userId]) : resolve(false);
            }).catch((e) => {
                reject(e);
            });
        }));
    }
    /**
     * @param {string} guildId - The ID of the Guild
     * @param {string} userId - The ID of the User
     *
     * @return {Promise<Object | boolean>} - Returns true if the user was created or an Error if there is one
     */
    async createUser(guildId, userId) {
        if (typeof guildId === "number")
            guildId = guildId.toString();
        if (typeof userId === "number")
            userId = userId.toString();
        return new Promise(((resolve, reject) => {
            /**
             * TODO: Insert isUser() check here
             */
            this._model.updateOne({ "_id": guildId }, { $set: { [`users.${userId}`]: { "xp": 0, "level": 0 } } }, (e) => {
                if (e)
                    reject(e);
                resolve(true);
            });
        }));
    }
    /**
     * @param {string} guildId - The ID of the Guild
     * @param {string} userId - The ID of the User
     *
     * @return {Promise<boolean | Error>} - Returns true if the user was deleted or an Error when there is one
     */
    async deleteUser(guildId, userId) {
        if (typeof guildId === "number")
            guildId = guildId.toString();
        if (typeof userId === "number")
            userId = userId.toString();
        return new Promise(((resolve, reject) => {
            /**
             * TODO: (Maybe) Insert isUser() check here
             */
            this._model.updateOne({ "_id": guildId }, { $unset: { [`users.${userId}`]: undefined } }, (e) => {
                if (e)
                    reject(e);
                resolve(true);
            });
        }));
    }
    /**
     * @param {string} guildId - The ID of the Guild
     *
     * @return {Promise<boolean | Error>} - Returns true if the guild was created or an Error if there is one
     */
    async createGuild(guildId) {
        if (typeof guildId === "number")
            guildId = guildId.toString();
        let guild = new this._model({ "_id": guildId, "users": {} });
        return new Promise((resolve, reject) => {
            /**
             * TODO: Insert isGuild() check here
             */
            guild.save((e) => {
                if (e)
                    reject(e);
                resolve(true);
            });
        });
    }
    /**
     * @param {string} guildId - The ID of the Guild
     *
     * @return {Promise<boolean | Error>} - Returns true if the guild was deleted or an Error if there is one
     */
    async deleteGuild(guildId) {
        if (typeof guildId === "number")
            guildId = guildId.toString();
        return new Promise(((resolve, reject) => {
            /**
             * TODO: (Maybe) Insert isGuild() check here
             */
            this._model.deleteOne({ "_id": guildId }).then((result) => {
                // result.deletedCount === 0 ? resolve(false) : resolve(true)
                resolve(true);
            }).catch((e) => {
                reject(e);
            });
        }));
    }
}
module.exports = LevelSystem;
