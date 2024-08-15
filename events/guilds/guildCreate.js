const Discord = require("discord.js");
const Premium = require("../../schemas/Premium");

module.exports = async (client) => {
  
  const color = client.config.color
  
  client.on("guildCreate", async guild => {

    if(client.user.id !== "1078779445457997915") {
      const bot = await Premium.findById(client.user.id)
      if(bot.guildId) {
        if(bot.guildId !== guild.id) return guild.leave();
      } else {
        guild.leave();
      }
    }
  
    guild.roles.create({
      name: "Clark Bot",
      color: color
    }).then(role => guild.member(client.user).roles.add(role)).catch(() => {});
  
    const logs = await guild.fetchAuditLogs().catch(() => {});
    if (logs) {
  
      const log = logs.entries.find(l => l.action === "BOT_ADD" && l.target.id === client.user.id);
      const executor = log.executor;
  
      const owner = await guild.fetchOwner();
      const server = client.guilds.cache.get(client.config.idSupport);
      const channel = server.channels.cache.get(client.config.idEarlyusers);
  
      channel.send(`> **<@${executor.id}> add the bot to server have \`${guild.memberCount}\`**, ServerName : ${guild.name}`)
  
    }
  
    let guildFind = await client.guild.findById(guild.id);
    if (!guildFind) {
      const owner = await guild.fetchOwner();
      await client.guild.findOneAndUpdate({
        _id: guild.id,
      },
        {
          language: "en",
          owner: owner.user.id,
          commands: "",
          prefix: "",
          line: {
            link: "",
          },
          reaction: {
            channel: "",
            emoji: "",
          },
          slowmode: {
            channel: "",
            time: "",
          },
          premium: {
            token: "",
            user: "",
            time: "",
          },
          autorole: {
            roles: "",
            toggle: "false",
          },
          welcome: {
            channel: "",
            toggle: "false",
          },
          trust: [""],
          protection: {
            antibot: "",
            antihack: "",
            antilink: {
              roles: "",
              toggle: "false",
              action: "",
            },
            antispam: {
              messages: "",
              toggle: "false",
              action: "",
            },
          },
          limit: {
            channels: "",
            bans: "",
            kicks: "",
            roles: "",
          },
          ticket: {
            channel: "",
            catrogy: "",
            embed: {
              title: "",
              description: "",
              button: "",
            },
          },
          logs: {
            message: {
              channel: "",
              toggle: "false",
            },
            channel: {
              channel: "",
              toggle: "false",
            },
            role: {
              channel: "",
              toggle: "false",
            },
            banned: {
              channel: "",
              toggle: "false",
            },
            kick: {
              channel: "",
              toggle: "false",
            },
            voice: {
              channel: "",
              toggle: "false",
            },
            guildMemberAdd: {
              channel: "",
              toggle: "false",
            },
            leaves: {
              channel: "",
              toggle: "false",
            },
          }
        },
        {
          upsert: true
        }).exec();
    }

    
  });

};