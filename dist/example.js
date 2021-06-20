const cronosXp = require("cronos-xp")

let levelSystem = new cronosXp("mongoDBUrlGoesHere", {
    growthMultiplier: 30,
    startWithZero: true,
    returnDetails: true
});

(function () {
    let level = 10
    let xp = levelSystem.xpForLevel(level)
    console.log(levelSystem.levelForXp(xp))

    console.log(levelSystem.xpForNext(290))
})();

(async function () {
    try {

        let isGuild = await levelSystem.isGuild("123");
        if (!isGuild) {
            let guild = await levelSystem.createGuild("123");
            if (!guild) return
        } else {
            console.log("Guild already exists no need to create a new one")
        }

        let isUser = await levelSystem.isUser("123", "456");
        if (!isUser) {
            let user = await levelSystem.createUser("123", "456");
            if (!user) return;
        } else {
            console.log("User already exists no need to create a new one")
        }

        let setXp = await levelSystem.setXp("134314134", "123", 12345);
        if (!setXp) return console.log("There was an error while setting the xp");

        let addXp = await levelSystem.addXp("123", "456", 1000);
        if (addXp.details) {
            console.log(`Xp from level ${addXp.newLevel} to ${addXp.newLevel + 1} = ${addXp.details.nextLevelXp - addXp.details.currentLevelXp}xp`);
            console.log(`But you only need ${addXp.details.nextLevelXp - addXp.newXp}xp to reach the next level`);
        } else {
            console.log(`You are now level ${addXp.newLevel} with a total of ${addXp.newXp}xp`);
        }

        let subLevel = await levelSystem.subtractLevel("123", "456", 3);
        if (subLevel.details) {
            console.log(`You just lost ${subLevel.details.xpDifference}`);
        }

        let userData = await levelSystem.getUser("123", "456");
        if (userData === false) {
            console.log("User doesnt exist")
        } else {
            console.log(userData)
        }

        let guildData = await levelSystem.getGuild("123");
        if (guildData === false) {
            console.log("Guild doesnt exist")
        } else {
            console.log(guildData)
        }

        let resetUser = await levelSystem.resetUser("123", "456");
        if (resetUser) return console.log(`User was successfully reset for this guild`);

        let resetUserGlobal = await levelSystem.resetUserGlobal("456");
        if (resetUserGlobal) return console.log(`User was successfully reset in all guilds`);

        let deletedUser = await levelSystem.deleteUser("123", "456");
        if (deletedUser) console.log("User was successfully deleted");

        let deleteUserGlobal = await levelSystem.deleteUserGlobal("456");
        if (deleteUserGlobal) console.log("User was successfully deleted in all guilds");

        let deletedGuild = await levelSystem.deleteGuild("123");
        if (deletedGuild) console.log("Guild was successfully deleted");

    } catch (error) {
        console.error(error)
    }
})();

(async function () {
    try {
        let top5 = await levelSystem.getLeaderboard("123", 5, 0)
        if (typeof top5 === "boolean") return console.log("There is no guild with that ID")
        for (let i = 0; i < 5; i++) {
            console.log(`${i + 1}: ${top5[i][0]}`)
        }
    } catch (error) {
        console.error(error)
    }
})()