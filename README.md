# <h1 align="center">Cronos-xp</h1>

<h1 align="center">A flexible xp-based level system framework that uses mongoDB</h1>  

This package was designed for [Discord](https://www.discord.com) but nothing is linking it to discord directly, so if you are searching for a general xp-based level system think of guildId as a group name and userId as the individual users. (*Note: guildId has to be unique, and the userId's inside that guild have to be unique as well*)


## Setup

```
npm i cronos-xp
```
```js
const CronosXp = require("cronos-xp")
const LevelSystem = new CronosXp("mongoDBUrlGoesHere", {
    growthMultiplier: 30, //Default value
    startWithZero: true,  //Default value
    returnDetails: false  //Default value
})
```
## Constructor Options

**growthMultiplier:**  
The XP needed for a level is calculated with the function ``ƒ(x) = g * x²`` where `g = growthMultiplier`.  
(A growthMultiplier of `0` equals `x`, turning the function into ``ƒ(x) = x³``)

**startWithZero:**  
Since ``ƒ(0) = g * 0²`` equals `0` the starting level would be `0`.  
In order to have it start with `1` set this property to `false`.  
(This changes the function to ``ƒ(x) = g * x² - g`` or ``ƒ(x) = x³ - x``)

**returnDetails:**  
If this option is on some functions will return more information than they normally do.  
This includes:  
* xpForNext()
* addXp()
* addLevel()
* subtractXp()
* subtractLevel()

For more information take a look at the Declaration file [index.d.ts](https://github.com/elttayman-Co/cronos-xp/blob/main/dist/index.d.ts)

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

#### xpForLevel()  
```js
LevelSystem.xpForLevel(<targetLevel - number>);

// Returns <number>
```

#### levelForXp()  
```js
LevelSystem.levelForXp(<targetXp - number>);

// Returns <number>
```

#### xpForNext()  
```js
LevelSystem.xpForNext(<currentXp - number>);

// Returns <number> | <object>
```

#### setXp()  
```js
LevelSystem.setXp(<guildId - string>, <userId - string>, <value - number>);

// Returns <Promise<boolean>>
```

#### setLevel()  
```js
LevelSystem.setLevel(<guildId - string>, <userId - string>, <value - number>);

// Returns <Promise<boolean>>
```

#### addXp()  
```js
LevelSystem.addXp(<guildId - string>, <userId - string>, <value - number>);

// Returns <Promise<object>>
```

#### addLevel()  
```js
LevelSystem.addLevel(<guildId - string>, <userId - string>, <value - number>);

// Returns <Promise<object>>
```

#### subtractXp()  
```js
LevelSystem.subtractXp(<guildId - string>, <userId - string>, <value - number>);

// Returns <Promise<object>>
```

#### subtractLevel()  
```js
LevelSystem.subtractLevel(<guildId - string>, <userId - string>, <value - number>);

// Returns <Promise<object>>
```

#### getLeaderboard()  
```js
LevelSystem.getLeaderboard(<guildId - string>, [<limit? - number>], [<startingAt? - number>]);

// Returns <Promise<[string, object][] | boolean>>
```

#### isUser()  
```js
LevelSystem.isUser(<guildId - string>, <userId - string>);

// Returns <Promise<boolean>>
```

#### getUser()  
```js
LevelSystem.getUser(<guildId - string>, <userId - string>);

// Returns <Promise<object | boolean>>
```

#### createUser()  
```js
LevelSystem.createUser(<guildId - string>, <userId - string>);

// Returns <Promise<boolean>>
```

#### deleteUser()  
```js
LevelSystem.deleteUser(<guildId - string>, <userId - string>);

// Returns <Promise<boolean>>
```

#### resetUser()  
```js
LevelSystem.resetUser(<guildId - string>, <userId - string>);

// Returns <Promise<boolean>>
```

#### isGuild()  
```js
LevelSystem.isGuild(<guildId - string>);

// Returns <Promise<boolean>>
```

#### getGuild()  
```js
LevelSystem.getGuild(<guildId - string>);

// Returns <Promise<boolean | object>>
```

#### createGuild()  
```js
LevelSystem.createGuild(<guildId - string>);

// Returns <Promise<boolean>>
```

#### deleteGuild()  
```js
LevelSystem.deleteGuild(<guildId - string>);

// Returns <Promise<boolean>>
```

## Private Static Methods

Those methods are just for validating function arguments  

#### _validateGuildId()  
```js
LevelSystem._validateGuildId(<guildId - string | number>);

// Returns <string>
```

#### _validateUserId()  
```js
LevelSystem._validateUserId(<userId - string | number>);

// Returns <string>
```
