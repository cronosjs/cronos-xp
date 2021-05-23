declare const mongoose: any;
declare const guildSchema: any;
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
declare class LevelSystem {
    private readonly _model;
    /**
     * @param {string} mongoUrl - The URL to the MongoDB
     */
    constructor(mongoUrl: string);
    /**
     * @param {string} guildId - The ID of the Guild
     * @param {string} userId - The ID of the User
     *
     * @return {Promise<Object | boolean>} - Returns the users data if he exists or false if he doesn't
     */
    getUser(guildId: string | number, userId: string | number): Promise<object | boolean>;
    /**
     * @param {string} guildId - The ID of the Guild
     * @param {string} userId - The ID of the User
     *
     * @return {Promise<Object | boolean>} - Returns true if the user was created or an Error if there is one
     */
    createUser(guildId: string | number, userId: string | number): Promise<boolean | Error>;
    /**
     * @param {string} guildId - The ID of the Guild
     * @param {string} userId - The ID of the User
     *
     * @return {Promise<boolean | Error>} - Returns true if the user was deleted or an Error when there is one
     */
    deleteUser(guildId: string | number, userId: string | number): Promise<boolean | Error>;
    /**
     * @param {string} guildId - The ID of the Guild
     *
     * @return {Promise<boolean | Error>} - Returns true if the guild was created or an Error if there is one
     */
    createGuild(guildId: string | number): Promise<boolean | Error>;
    /**
     * @param {string} guildId - The ID of the Guild
     *
     * @return {Promise<boolean | Error>} - Returns true if the guild was deleted or an Error if there is one
     */
    deleteGuild(guildId: string | number): Promise<boolean | Error>;
}
