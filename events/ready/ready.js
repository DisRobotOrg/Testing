const Premium = require("../../schemas/Premium");

module.exports = async (client) => {
  client.on("ready", async () => {
    console.log(`${client.user.tag} is up and ready to go!`)
    if (client.user.id == "824590114419769404") {
    } else {
      const bot = await Premium.findById(client.user.id)
      if(client.user.id !== "824590114419769404" && bot && bot.theme == "red") {
          client.config = require("../../red/config.json");
          client.emoji = require("../../red/emoji.json");
          color = client.config.color;
        }
        
        if(client.user.id !== "824590114419769404" && bot && bot.theme == "cayan") {
          client.config = require("../../cayan/config.json");
          client.emoji = require("../../cayan/emoji.json");
          color = client.config.color;
        }
        
        if(client.user.id !== "824590114419769404" && bot && bot.theme == "yellow") {
          client.config = require("../../config.json");
          client.emoji = require("../../emoji.json");
          color = client.config.color;
        }
      const nameActivity = bot ? bot.activity ? bot.activity : '/help' : '/help';
      client.user.setPresence({ activities: [{ name: nameActivity }], status: "idle" })
      if (bot) {
        setInterval(async () => {
          const timeout = Date.now() - bot.date;
          if (timeout > 2592000000) {
            client.guilds.cache.map(guild => guild.leave());

            fs.unlink("./premiumBots/" + bot._id + ".js", (err) => {
              if (err) {
              }
            })
            await Premium.findByIdAndUpdate(bot._id, {
              guildId: "",
              use: "false",
              owner: "",
              activity: "",
              theme: "yellow",
            },
              {
                upsert: true
              })
          }
        }, 3600000)
      }
    }
  });
};