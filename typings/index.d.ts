declare const mongoose: any;
declare const guildSchema: any;
declare class MissingArgumentException extends Error {
    constructor(message: string);
}
/**
 * @property {number} [growthMultiplier = 30]
 * @property {number} [startWithZero = true]
 * @example
 * // growthMultiplier = 0 means x³ and not 0 * x²
 * const DefaultValues = {
 *     growthMultiplier = 30,
 *     startWithZero = true
 * }
 */
interface ConstructorOptions {
    growthMultiplier?: number;
    startWithZero?: boolean;
}
/**
 * @property {number} xp
 * @property {number} level
 */
interface User {
    xp: number;
    level: number;
}
/**
 * @property {number} newLevel
 * @property {number} newXp
 * @property {number} [hasLevelUp]
 * @property {number} [hasLevelDown]
 */
interface AddSubtractReturnObject {
    newLevel: number;
    newXp: number;
    hasLevelUp?: boolean;
    hasLevelDown?: boolean;
}
/**
 * TODO:
 *  - Either adding a few Properties to Interface "AddSubtractReturnObject" or a function to get amount of XP till next level
 *  - Test if everything works as its supposed to
 *  - Adding proper example.js file
 *  - Adding a readme.md explaining everything
 *  - Refactoring files etc and create an NPM package
 */
declare class LevelSystem {
    private readonly _model;
    private readonly _growthMultiplier;
    private readonly _startWithZero;
    /**
     * @param {string} mongoUrl - The URL to the mongoDB
     * @param {options} [options] - An optional parameter for options
     */
    constructor(mongoUrl: string, options?: ConstructorOptions);
    /**
     * Function that returns the amount of xp needed for a certain level
     * @param {number} targetLevel - The desired level
     * @returns {number} - Amount of xp needed for targetLevel
     * @throws {TypeError} - If the growthMultiplier isn't a number
     */
    xpForLevel(targetLevel: number): number;
    /**
     * Function that returns the level for a specific amount of xp
     * @param {number} targetXp - The desired xp
     * @returns {number} - The level at this amount of xp
     * @throws {TypeError} - If the growthMultiplier isn't a number
     */
    levelForXp(targetXp: number): number;
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
    setXp(guildId: string | number, userId: string | number, value: number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The level which the level and xp are set to
     * @returns {Promise<boolean>} - Returns true if the operation was successful
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    setLevel(guildId: string | number, userId: string | number, value: number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of xp to add to that user
     * @returns {Promise<AddSubtractReturnObject>} - Returns an object with properties "newLevel", "newXp", "hasLevelUp"
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If the user couldn't be found or if there was a problem with the update operation
     */
    addXp(guildId: string | number, userId: string | number, value: number): Promise<AddSubtractReturnObject>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of levels to add to that user
     * @returns {Promise<AddSubtractReturnObject>} - Returns an object with properties "newLevel", "newXp", "hasLevelUp"
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If the user couldn't be found or if there was a problem with the update operation
     */
    addLevel(guildId: string | number, userId: string | number, value: number): Promise<AddSubtractReturnObject>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of xp to remove from that user
     * @returns {Promise<AddSubtractReturnObject>} - Returns an object with properties "newLevel", "newXp", "hasLevelDown"
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If the user couldn't be found or if there was a problem with the update operation
     */
    subtractXp(guildId: string | number, userId: string | number, value: number): Promise<AddSubtractReturnObject>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of levels to remove from that user
     * @returns {Promise<AddSubtractReturnObject>} - Returns an object with properties "newLevel", "newXp", "hasLevelDown"
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If the user couldn't be found or if there was a problem with the update operation
     */
    subtractLevel(guildId: string | number, userId: string | number, value: number): Promise<AddSubtractReturnObject>;
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
    getLeaderboard(guildId: string | number, limit?: number): Promise<[string, unknown][] | boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if user exists and false if he doesn't
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    isUser(guildId: string | number, userId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<Object | boolean>} - Returns the users data if he exists or false if he doesn't
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    getUser(guildId: string | number, userId: string | number): Promise<User | boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if the user was created
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there already is a user with this id in this guild or if there was a problem with the update operation
     */
    createUser(guildId: string | number, userId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if the user was deleted
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    deleteUser(guildId: string | number, userId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if the user was reset
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    resetUser(guildId: string | number, userId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {Promise<boolean>} - Returns true if guild exists and false if it doesn't
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    isGuild(guildId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {Promise<boolean | Object>} - Returns the guilds data if it exists or false if he doesn't
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    getGuild(guildId: string | number): Promise<boolean | Object>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {Promise<boolean>} - Returns true if the guild was created
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    createGuild(guildId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {Promise<boolean>} - Returns true if the guild was deleted
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     * @throws {Error} - If there was a problem with the update operation
     */
    deleteGuild(guildId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {string} - A valid guildId as a string
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     */
    private static _validateGuildId;
    /**
     * @param {(string | number)} userId - The id of the user
     * @returns {string} - A valid userId as a string
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {TypeError} - If a different argument type was expected
     */
    private static _validateUserId;
}
