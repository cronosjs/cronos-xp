# <h1 align="center">Cronos-xp</h1>

<h1 align="center">A flexible xp-based level system framework that uses mongoDB</h1>  

This package was designed for [Discord](https://www.discord.com) but nothing is linking it to discord directly, so if you are searching for a general xp-based level system think of guildId as a group name and userId as the individual users. (*Note: guildId has to be unique, and the userId's inside that guild have to be unique as well*)


## Setup

```
npm i cronos-xp
```
```js
const CronosXp = require("cronos-xp")
const Level = new CronosXp("mongoDBUrlGoesHere", {
    growthMultiplier: 30, //Default value
    startWithZero: true,  //Default value
    returnDetails: false  //Default value
})
```
## Constructor Options

**growthMultiplier:**  
The XP needed for a level is calculated with the function ``ƒ(x) = g * x²`` where `g = growthMultiplier`.  
(A growthMultiplier of `0` equals `x`, turning the function into ``ƒ(x) = x³``)  

*Noob tip:*  
*High `growthMultiplier` = rapid increase in the amount of xp needed for the next level.*  
*Low `growthMultiplier` = slow increase in the amount of xp needed for the next level.*

**startWithZero:**  
Since ``ƒ(0) = g * 0²`` equals `0` the starting level would be `0`.  
In order to have it start with `1` set this property to `false`.  
(This changes the function to ``ƒ(x) = g * x² - g`` or ``ƒ(x) = x³ - x``)

**returnDetails:**  
If this option is on some functions will return more information than they normally do.  
This includes:  
* [xpForNext()](https://github.com/cronos-team/cronos-xp#xpfornext)
* [addXp()](https://github.com/cronos-team/cronos-xp#addxp)
* [addLevel()](https://github.com/cronos-team/cronos-xp#addlevel)
* [subtractXp()](https://github.com/cronos-team/cronos-xp#subtractxp)
* [subtractLevel()](https://github.com/cronos-team/cronos-xp#subtractlevel)

For more information take a look at the Declaration file [index.d.ts](https://github.com/cronos-team/cronos-xp/blob/main/dist/index.d.ts)

## Object Structure
#### ConstructorOptions
```ts
interface ConstructorOptions {
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

If `returnDetails` is true this will return an object of type [XpForNextReturnObject](https://github.com/cronos-team/cronos-xp#xpfornextreturnobject).
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
Returns object of type [AddSubtractReturnObject](https://github.com/cronos-team/cronos-xp#addsubtractreturnobject)

If `returnDetails` is true the returned object will have a `details` property that looks like [this](https://github.com/cronos-team/cronos-xp#details).
```js
Level.addXp(<guildId - string>, <userId - string>, <value - number>);

// Returns <Promise<AddSubtractReturnObject>>
```

#### addLevel()  
A method that adds a specific amount of level to a specific user in a specific guild.
Returns object of type [AddSubtractReturnObject](https://github.com/cronos-team/cronos-xp#addsubtractreturnobject)

If `returnDetails` is true the returned object will have a `details` property that looks like [this](https://github.com/cronos-team/cronos-xp#details).
```js
Level.addLevel(<guildId - string>, <userId - string>, <value - number>);

// Returns <Promise<AddSubtractReturnObject>>
```

#### subtractXp()  
A method that subtracts a specific amount of xp from a specific user in a specific guild.
Returns object of type [AddSubtractReturnObject](https://github.com/cronos-team/cronos-xp#addsubtractreturnobject)

If `returnDetails` is true the returned object will have a `details` property that looks like [this](https://github.com/cronos-team/cronos-xp#details).
```js
Level.subtractXp(<guildId - string>, <userId - string>, <value - number>);

// Returns <Promise<AddSubtractReturnObject>>
```

#### subtractLevel()
A method that subtracts a specific amount of level from a specific user in a specific guild.
Returns object of type [AddSubtractReturnObject](https://github.com/cronos-team/cronos-xp#addsubtractreturnobject)

If `returnDetails` is true the returned object will have a `details` property that looks like [this](https://github.com/cronos-team/cronos-xp#details).
```js
Level.subtractLevel(<guildId - string>, <userId - string>, <value - number>);

// Returns <Promise<AddSubtractReturnObject>>
```

#### getLeaderboard()  
A method that returns the top users of a guild sorted by their amount of xp.  
`limit` is an option parameter to change the amount of users that are being returned *(Default: 10)*.  
`startingAt` is an option parameter to change where the list of returned users start *(Default: 0)*.  
*(If `startingAt` is 2 for example it will start with the third place.)*

Returns an array of arrays that contain a string being the userid and, an object of type [User](https://github.com/cronos-team/cronos-xp#user).
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

If the user exists it returns an object of type [User](https://github.com/cronos-team/cronos-xp#user).
```js
Level.getUser(<guildId - string>, <userId - string>);

// Returns <Promise<User | boolean>>
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

#### resetUser()  
A method to reset a users xp and level inside a specific guild
```js
Level.resetUser(<guildId - string>, <userId - string>);

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

Returns an object that uses the userid's as the key and has their user object of type [User](https://github.com/cronos-team/cronos-xp#user) as their value.
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
