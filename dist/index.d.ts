/**
 * @property {boolean} [linear = false]
 * @property {number} [xpGap = 300]
 * @property {number} [growthMultiplier = 30]
 * @property {boolean} [startWithZero = true]
 * @property {boolean} [returnDetails = false]
 * @example
 * // growthMultiplier = 0 means x³ and not 0 * x²
 * const DefaultValues = {
 *     linear = false,
 *     xpGap = 300,
 *     growthMultiplier = 30,
 *     startWithZero = true,
 *     returnDetails = false
 * }
 */
interface ConstructorOptions {
    linear?: boolean;
    xpGap?: number;
    growthMultiplier?: number;
    startWithZero?: boolean;
    returnDetails?: boolean;
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
 * @property {number} xpDifference
 * @property {number} levelDifference
 * @property {number} nextLevelXp
 * @property {number} currentLevelXp
 */
interface Details {
    xpDifference: number;
    levelDifference: number;
    nextLevelXp: number;
    currentLevelXp: number;
}
/**
 * @property {number} newLevel
 * @property {number} newXp
 * @property {number} [hasLevelUp]
 * @property {number} [hasLevelDown]
 * @property {Details} [details]
 */
interface AddSubtractReturnObject {
    newLevel: number;
    newXp: number;
    hasLevelUp?: boolean;
    hasLevelDown?: boolean;
    details?: Details;
}
/**
 * @property {number} xpNeeded
 * @property {number} currentLevel
 * @property {number} nextLevel
 * @property {number} currentLevelXp
 * @property {number} nextLevelXp
 */
interface XpForNextReturnObject {
    xpNeeded: number;
    currentLevel: number;
    nextLevel: number;
    currentLevelXp: number;
    nextLevelXp: number;
}
/**
 * A LevelSystem class that works with a mongoDB and allows for quite some flexibility.
 *
 * See the {@link https://github.com/cronos-team/cronos-xp#readme readme}
 */
declare class LevelSystem {
    private _model;
    private readonly _linear;
    private readonly _xpGap;
    private readonly _growthMultiplier;
    private readonly _startWithZero;
    private readonly _returnDetails;
    /**
     * @param {string} mongoUrl - The URL to the mongoDB
     * @param {ConstructorOptions} [options] - A parameter for options
     */
    constructor(mongoUrl: string, options?: ConstructorOptions);
    /**
     * This method closes the connection to the database and deletes the current model
     */
    destroy(): Promise<unknown>;
    /**
     * Method that returns the amount of xp needed for a certain level
     * @param {number} targetLevel - The desired level
     * @returns {number} - Amount of xp needed for targetLevel
     */
    xpForLevel(targetLevel: number): number;
    /**
     * Method that returns the level for a specific amount of xp
     * @param {number} targetXp - The desired xp
     * @returns {number} - The level at this amount of xp
     */
    levelForXp(targetXp: number): number;
    /**
     * Method that returns the amount of xp needed to reach the next level
     * @param {number} currentXp - The current xp on which the calculations for the next level are based on
     * @returns {(number | XpForNextReturnObject)} - The amount of xp needed or the current and next level as well as their min required XP
     */
    xpForNext(currentXp: number): number | XpForNextReturnObject;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of xp which the level and xp are set to
     * @returns {Promise<boolean>} - Returns true if the operation was successful
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If the guild or user doesn't exist or if there was a problem with the update operation
     */
    setXp(guildId: string | number, userId: string | number, value: number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The level which the level and xp are set to
     * @returns {Promise<boolean>} - Returns true if the operation was successful
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If the guild or user doesn't exist or if there was a problem with the update operation
     */
    setLevel(guildId: string | number, userId: string | number, value: number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of xp to add to that user
     * @returns {Promise<AddSubtractReturnObject>} - Returns an object of type "AddSubtractReturnObject"
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If the user couldn't be found or if there was a problem with the update operation
     */
    addXp(guildId: string | number, userId: string | number, value: number): Promise<AddSubtractReturnObject>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of levels to add to that user
     * @returns {Promise<AddSubtractReturnObject>} - Returns an object of type "AddSubtractReturnObject"
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If the user couldn't be found or if there was a problem with the update operation
     */
    addLevel(guildId: string | number, userId: string | number, value: number): Promise<AddSubtractReturnObject>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of xp to remove from that user
     * @returns {Promise<AddSubtractReturnObject>} - Returns an object of type "AddSubtractReturnObject"
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If the user couldn't be found or if there was a problem with the update operation
     */
    subtractXp(guildId: string | number, userId: string | number, value: number): Promise<AddSubtractReturnObject>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @param {number} value - The amount of levels to remove from that user
     * @returns {Promise<AddSubtractReturnObject>} - Returns an object of type "AddSubtractReturnObject"
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If the user couldn't be found or if there was a problem with the update operation
     */
    subtractLevel(guildId: string | number, userId: string | number, value: number): Promise<AddSubtractReturnObject>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {number} [limit = 10] - The amount of leaderboard entries to return
     * @param {number} [startingAt = 0] - At which place to start (0 = start from first, 2 = start from third, ...)
     * @returns {Promise<[string, User][]> | boolean} - Returns an array of arrays that consist of the id as a string and "User" object
     * @example
     * //Returns:
     * [["id1", {xp: 0, level: 0}], ["id2", {xp: 0, level: 0}], ...]
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If there was a problem with the update operation
     */
    getLeaderboard(guildId: string | number, limit?: number, startingAt?: number): Promise<[string, User][] | boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if user exists and false if he doesn't
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If there was a problem with the update operation
     */
    isUser(guildId: string | number, userId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<User | boolean>} - Returns the users data if he exists or false if he doesn't
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If there was a problem with the update operation
     */
    getUser(guildId: string | number, userId: string | number): Promise<User | boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if the user was created
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If there already is a user with this id in this guild or if there was a problem with the update operation
     */
    createUser(guildId: string | number, userId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if the user was deleted
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If there was a problem with the update operation
     */
    deleteUser(guildId: string | number, userId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if the user was deleted globally
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If there was a problem with the update operation
     */
    deleteUserGlobal(userId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if the user was reset
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If there was a problem with the update operation
     */
    resetUser(guildId: string | number, userId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} userId - The id of the user
     * @returns {Promise<boolean>} - Returns true if the user was reset globally
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If there was a problem with the update operation
     */
    resetUserGlobal(userId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {Promise<boolean>} - Returns true if guild exists and false if it doesn't
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If there was a problem with the update operation
     */
    isGuild(guildId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {Promise<boolean | object>} - Returns the guilds data if it exists or false if he doesn't
     * @example
     * //Returns:
     * {
     *     "123": {xp: 0, level: 0},
     *     "456": {xp: 0, level: 0},
     *     "789": {xp: 0, level: 0}
     * }
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If there was a problem with the update operation
     */
    getGuild(guildId: string | number): Promise<boolean | object>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {Promise<boolean>} - Returns true if the guild was created and false if it already exists
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If there was a problem with the update operation
     */
    createGuild(guildId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {Promise<boolean>} - Returns true if the guild was deleted
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If there was a problem with the update operation
     */
    deleteGuild(guildId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {Promise<boolean>} - Returns true if the guild was reset
     * @throws {MissingArgumentException} - If there is a missing argument
     * @throws {Error} - If there was a problem with the update operation
     */
    resetGuild(guildId: string | number): Promise<boolean>;
    /**
     * @param {(string | number)} guildId - The id of the guild
     * @returns {string} - A valid guildId as a string
     * @throws {MissingArgumentException} - If there is a missing argument
     */
    private static _validateGuildId;
    /**
     * @param {(string | number)} userId - The id of the user
     * @returns {string} - A valid userId as a string
     * @throws {MissingArgumentException} - If there is a missing argument
     */
    private static _validateUserId;
}
export = LevelSystem;
