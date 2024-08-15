const Discord = require("discord.js");
module.exports = async (client) => {
  const color = client.config.color

  client.on("channelCreate", async (channel) => {
    const Premium = require("../../schemas/Premium");
    const masters = await Premium.findOne({ guildId: channel.guild.id });
    if (masters && client.user.id !== masters._id) return;

    const owner = await channel.guild.fetchOwner();
    if (await client.guild.findById(channel.guild.id)) {
      const guild = await client.guild.findById(channel.guild.id)
      if (guild.logs.channel) {
        if (await guild.logs.channel.toggle === "true") {
          let channell = channel.guild.channels.cache.get(await guild.logs.channel.channel);
          const logs = await channel.guild.fetchAuditLogs().catch(console.error);
          if (logs) {
            const log = logs.entries.find(l => l.action === Discord.AuditLogEvent.ChannelCreate);
            const executor = log.executor;
            if (channell) {
              if (executor === client.user) {
                const exampleEmbed = new Discord.EmbedBuilder()
                  .setColor(color)
                  .setThumbnail(executor.avatarURL())
                  .setTitle(`Channel Created By ${executor.username}`)
                  .addFields(
                    { name: `**Created By :**`, value: `[ **${executor}** ]`, inline: true },
                    { name: `**Channel :**`, value: `[ **${channel}** ]`, inline: true },
                    { name: `**Type :**`, value: `**\`${channel.type === 0 ? "Text Channel" : channel.type === 2 ? "Voice Channel" : "Categorey"}\`**`, inline: true },
                    { name: `**Reason :**`, value: `**\`Anti Hack\`**`, inline: true },
                  )
                  .setTimestamp();
                channell.send({ embeds: [exampleEmbed] })
              } else {
                const exampleEmbed = new Discord.EmbedBuilder()
                  .setColor(color)
                  .setThumbnail(executor.avatarURL())
                  .setTitle(`Channel Created By ${executor.username}`)
                  .addFields(
                    { name: `**Created By :**`, value: `[ **${executor}** ]`, inline: true },
                    { name: `**Channel :**`, value: `[ **${channel}** ]`, inline: true },
                    { name: `**Type :**`, value: `**\`${channel.type === 0 ? "Text Channel" : channel.type === 2 ? "Voice Channel" : "Categorey"}\`**`, inline: true },
                  )
                  .setTimestamp();
                channell.send({ embeds: [exampleEmbed] })
              }
            }
          }
        }
      }
      if (await guild.autorestore.channels === "true") {
        const logs = await channel.guild.fetchAuditLogs().catch(console.error);
        if (logs) {
          const log = logs.entries.find(l => l.action === Discord.AuditLogEvent.ChannelCreate);
          const executor = log.executor;
          if (executor !== owner.user && executor.id !== client.user.id && !guild.trust.includes(executor.id)) {
            channel.delete()
          }
        }
      }


      if (guild.protection.antihack == "true") {

        const logsFinds = await channel.guild.fetchAuditLogs({ limit: 1, type: Discord.AuditLogEvent.ChannelCreate, }).catch(console.error);
        const logsFind = logsFinds.entries.first();
        const executorFind = logsFind.executor;

        if (executorFind !== owner.user && executorFind.id !== client.user.id && !guild.trust.includes(executorFind.id)) {
          
          await channel.guild.fetchAuditLogs().then(logs => {
            let actions = logs.entries
              .filter(e => e.action === Discord.AuditLogEvent.ChannelCreate && e.executor.id === executorFind.id && (e.createdAt - Date.now()) < 86400000)

            let limit = guild.limit.channels || 5;
            if (actions.size > parseInt(limit) || actions.size == parseInt(limit)) {

              // None
              if(!guild.action.channels || guild.action.channels === "none") return;

              // Roles
              if(guild.action.channels === "roles") {
                const member = channel.guild.members.cache.get(executorFind.id)
                const roles = member.roles.cache;
                  member.roles.remove(roles);

                if(guild.notification && guild.notification === "true") {
                  const exampleEmbed = new Discord.EmbedBuilder()
                    .setColor(color)
                    .setThumbnail(executorFind.avatarURL())
                    .setTitle(`Counter an attack by: ${executorFind.username}`)
                    .addFields(
                      { name: `**Action :**`, value: `[** ChannelCreate Limit **]`, inline: true },
                      { name: `**Reply :**`, value: `[** Remove all member Roles **]`, inline: true },
                      { name: `**Limit :**`, value: `**\`${actions.size}/${limit}\`**`, inline: true },
                    )
                    .setTimestamp();
                  owner.user.send({ embeds: [exampleEmbed] })
                }

              }

              // Kick 
              if(guild.action.channels === "kick") {
                channel.guild.members.kick(executorFind.id, { reason: 'Failed attempt to sabotage the server ..' }).then(() => {
                  if(guild.notification && guild.notification === "true") {
                    const exampleEmbed = new Discord.EmbedBuilder()
                      .setColor(color)
                      .setThumbnail(executorFind.avatarURL())
                      .setTitle(`Counter an attack by: ${executorFind.username}`)
                      .addFields(
                        { name: `**Action :**`, value: `[** ChannelCreate Limit **]`, inline: true },
                        { name: `**Reply :**`, value: `[** Mamber Kicked **]`, inline: true },
                        { name: `**Limit :**`, value: `**\`${actions.size}/${limit}\`**`, inline: true },
                      )
                      .setTimestamp();
                    owner.user.send({ embeds: [exampleEmbed] })
                  }
                })
              }

              // Ban 
              if(guild.action.channels === "ban") {
                channel.guild.members.ban(executorFind.id, { days: 7, reason: 'Failed attempt to sabotage the server .. 7 days ban ..' }).then(() => {
                  if(guild.notification && guild.notification === "true") {
                    const exampleEmbed = new Discord.EmbedBuilder()
                      .setColor(color)
                      .setThumbnail(executorFind.avatarURL())
                      .setTitle(`Counter an attack by: ${executorFind.username}`)
                      .addFields(
                        { name: `**Action :**`, value: `[** ChannelCreate Limit **]`, inline: true },
                        { name: `**Reply :**`, value: `[** Mamber Banned **]`, inline: true },
                        { name: `**Limit :**`, value: `**\`${actions.size}/${limit}\`**`, inline: true },
                      )
                      .setTimestamp();
                    owner.user.send({ embeds: [exampleEmbed] })
                  }
                })
              }

            }
          })
          
        }
      }

    }
  });

};
