<p align="center">
  <a href="https://github.com/cronos-team/cronos-xp">
    <img src="https://cdn.discordapp.com/attachments/792903485594665000/848942478286520370/XPPRUEBA.png" alt="cronos xp" />
  </a>
</p> 

<p align="center">
  <a href="https://discord.gg/eXrQv9e699">
    <img src="https://discord.com/api/guilds/841765316619141190/widget.png" alt="Discord server"/>
  </a>
</p>  

A flexible xp-based level system framework that uses mongoDB
  
This package was designed for [Discord](https://www.discord.com) but nothing is linking it to discord directly, so if you are searching for a general xp-based level system think of guildId as a group name and userId as the individual users. (*Note: guildId has to be unique, and the userId's inside that guild have to be unique as well*)


## Setup

```
npm i cronos-xp
```
```js
const CronosXp = require("cronos-xp")
const Level = new CronosXp("mongoDBUrlGoesHere", {
    linear: false,        //Default value
    xpGap: 300,           //Default value
    growthMultiplier: 30, //Default value
    startWithZero: true,  //Default value
    returnDetails: false  //Default value
})
```
## Constructor Options
**linear:**  
Defines if the leveling is linear *(aka. you always need the same amount of xp for each level)* or exponential *(see below)*.  
[Here](#example) is an example of how it works

**xpGap:**  
*Only needed if **linear** is true*  
This value defines the xp gap between the different levels

**growthMultiplier:**  
*Only needed if **linear** is false*  
The XP needed for a level is calculated with the function ``ƒ(x) = g * x²`` where `g = growthMultiplier`.  
(A growthMultiplier of `0` equals `x`, turning the function into ``ƒ(x) = x³``)  

*Hint:*  
*High `growthMultiplier` = rapid increase in the amount of xp needed for the next level.*  
*Low `growthMultiplier` = slow increase in the amount of xp needed for the next level.*

**startWithZero:**  
Since ``ƒ(0) = g * 0²`` equals `0` the starting level would be `0`.  
To have it start with level `1` set this property to `false`.  
(This changes the function to ``ƒ(x) = g * x² - g`` or ``ƒ(x) = x³ - x``)

**returnDetails:**  
If this option is on some functions will return more information than they normally do.  
This includes:  
* [xpForNext()](#xpfornext)
* [addXp()](#addxp)
* [addLevel()](#addlevel)
* [subtractXp()](#subtractxp)
* [subtractLevel()](#subtractlevel)

For more information take a look at the Declaration file [index.d.ts](https://github.com/cronos-team/cronos-xp/blob/main/dist/index.d.ts)

## Example
```ts
linear = true; xpGap = 500;
level 0 = "0xp"
level 1 = "500xp"
level 2 = "1,000xp"
//...
level 50 = "25,000xp"
level 51 = "25,500xp"
level 52 = "26,000xp"
//...
level 90 = "45,000xp"
level 91 = "45,500xp"
level 92 = "46,000xp"

linear = false; growthMultiplier = 20;
level 0 = "0xp"
level 1 = "20xp"
level 2 = "80xp"
//...
level 50 = "50,000xp"
level 51 = "52,020xp"
level 52 = "54,080xp"
//...
level 90 = "162,000xp"
level 91 = "165,620xp"
level 92 = "169,280xp"
```

## Object Structure
#### ConstructorOptions
```ts
interface ConstructorOptions {
    linear?: boolean,
    xpGap?: number,
    growthMultiplier?: number,
    startWithZero?: boolean,
    returnDetails?: boolean
}
```
#### User
```ts
interface User {
    xp: number,
    level: number
}
```
#### Details
```ts
interface Details {
    xpDifference: number,
    levelDifference: number,
    nextLevelXp: number,
    currentLevelXp: number
}
```
#### AddSubtractReturnObject
```ts
interface AddSubtractReturnObject {
    newLevel: number,
    newXp: number,
    hasLevelUp?: boolean,   // Exists on addXp or addLevel
    hasLevelDown?: boolean, // Exists on subtractXp or subtractLevel
    details?: Details       // This only exists when `returnDetails` is enabled
}
```
#### XpForNextReturnObject
```ts
interface XpForNextReturnObject {
    xpNeeded: number,
    currentLevel: number,
    nextLevel: number,
    currentLevelXp: number,
    nextLevelXp: number
}
```

## Public Instance Methods

If there are any questions about the methods, their parameters, their return types or anything thing else take a look at the Declaration file [index.d.ts](https://github.com/cronos-team/cronos-xp/blob/main/dist/index.d.ts)
or just join our [Discord](https://discord.gg/eXrQv9e699)
<br/>
#### xpForLevel()  
A method that calculates the minimum amount of xp needed for a specific level.
```js
Level.xpForLevel(<targetLevel - number>);

// Returns <number>
```

#### levelForXp()  
A method that calculates the level for a specific amount of xp.
```js
Level.levelForXp(<targetXp - number>);

// Returns <number>
```

#### xpForNext()  
A method that calculates the amount of xp needed to reach the next level based on the current xp.

If `returnDetails` is true this will return an object of type [XpForNextReturnObject](#xpfornextreturnobject).
```js
Level.xpForNext(<currentXp - number>);

// Returns <number> | <XpForNextReturnObject>
```

#### setXp()  
A method to set the amount of xp for a specific user inside a specific guild.
```js
Level.setXp(<guildId - string>, <userId - string>, <value - number>);

// Returns <Promise<boolean>>
```

#### setLevel()  
A method to set the level for a specific user inside a specific guild.
```js
Level.setLevel(<guildId - string>, <userId - string>, <value - number>);

// Returns <Promise<boolean>>
```

#### addXp()  
A method that adds a specific amount of xp to a specific user in a specific guild.
Returns object of type [AddSubtractReturnObject](#addsubtractreturnobject)

If `returnDetails` is true the returned object will have a `details` property that looks like [this](#details).
```js
Level.addXp(<guildId - string>, <userId - string>, <value - number>);

// Returns <Promise<AddSubtractReturnObject>>
```

#### addLevel()  
A method that adds a specific amount of level to a specific user in a specific guild.
Returns object of type [AddSubtractReturnObject](#addsubtractreturnobject)

If `returnDetails` is true the returned object will have a `details` property that looks like [this](#details).
```js
Level.addLevel(<guildId - string>, <userId - string>, <value - number>);

// Returns <Promise<AddSubtractReturnObject>>
```

#### subtractXp()  
A method that subtracts a specific amount of xp from a specific user in a specific guild.
Returns object of type [AddSubtractReturnObject](#addsubtractreturnobject)

If `returnDetails` is true the returned object will have a `details` property that looks like [this](#details).
```js
Level.subtractXp(<guildId - string>, <userId - string>, <value - number>);

// Returns <Promise<AddSubtractReturnObject>>
```

#### subtractLevel()
A method that subtracts a specific amount of level from a specific user in a specific guild.
Returns object of type [AddSubtractReturnObject](#addsubtractreturnobject)

If `returnDetails` is true the returned object will have a `details` property that looks like [this](#details).
```js
Level.subtractLevel(<guildId - string>, <userId - string>, <value - number>);

// Returns <Promise<AddSubtractReturnObject>>
```

#### getLeaderboard()  
A method that returns the top users of a guild sorted by their amount of xp.  
`limit` is an optional parameter to change the number of users that are being returned *(Default: 10)*.  
`startingAt` is an optional parameter to change where the list of returned users start *(Default: 0)*.  
*(If `startingAt` is 2 for example it will start with the third place.)*

Returns an array of arrays that contain a string being the userid and, an object of type [User](#user).
```js
Level.getLeaderboard(<guildId - string>[, <limit? - number>, <startingAt? - number>]);

// Returns <Promise<[string, User][] | boolean>>
```

#### isUser()  
A method to find out if a specific user exists in a specific guild.
```js
Level.isUser(<guildId - string>, <userId - string>);

// Returns <Promise<boolean>>
```

#### getUser()  
A method to get the data of a specific user in a specific guild.

If the user exists it returns an object of type [User](#user).
```js
Level.getUser(<guildId - string>, <userId - string>);

// Returns <Promise<User | boolean>>
```

#### getUserRank()
A method to get the Rank of a specific user in a specific guild.

If the user exists it returns his rank, otherwise it will return 0 or throw an error.
```js
Level.getUserRank(<guildId - string>, <userId - string>);

// Returns <Promise<number>>
```

#### createUser()  
A method to create a new user in a specific guild.
```js
Level.createUser(<guildId - string>, <userId - string>);

// Returns <Promise<boolean>>
```

#### deleteUser()  
A method to delete a user in a specific guild.
```js
Level.deleteUser(<guildId - string>, <userId - string>);

// Returns <Promise<boolean>>
```

#### deleteUserGlobal()
A method to delete a user in all guilds.
```js
Level.deleteUserGlobal(<userId - string>);

// Returns <Promise<boolean>>
```

#### resetUser()  
A method to reset a users xp and level inside a specific guild.
```js
Level.resetUser(<guildId - string>, <userId - string>);

// Returns <Promise<boolean>>
```

#### resetUserGlobal()
A method to reset a users xp and level in all guilds.
```js
Level.resetUserGlobal(<userId - string>);

// Returns <Promise<boolean>>
```

#### isGuild()  
A method to find out if a specific guild exists.
```js
Level.isGuild(<guildId - string>);

// Returns <Promise<boolean>>
```

#### getGuild()  
A method to get all users of a guild.

Returns an object that uses the userid's as the key and has their user object of type [User](#user) as their value.
```js
Level.getGuild(<guildId - string>);

// Returns <Promise<boolean | object>>
```

#### createGuild()  
A method to create a new guild.
```js
Level.createGuild(<guildId - string>);

// Returns <Promise<boolean>>
```

#### deleteGuild()  
A method to delete a specific guild.
```js
Level.deleteGuild(<guildId - string>);

// Returns <Promise<boolean>>
```

#### resetGuild()
A method to delete all users of a specific guild
```js
Level.resetUser(<guildId - string>);

// Returns <Promise<boolean>>
```

#### destroy()
A method that closes the MongoDB connection and clears the GuildXP model.
```js
Level.destroy();

// Returns <Promise<boolean>>
```

## Private Static Methods

Those methods are just for validating function arguments  

#### _validateGuildId()  
```js
Level._validateGuildId(<guildId - string | number>);

// Returns <string>
```

#### _validateUserId()  
```js
Level._validateUserId(<userId - string | number>);

// Returns <string>
```
