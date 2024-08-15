const Discord = require("discord.js");

module.exports = async (client) => {
  const color = client.config.color

  client.on("guildBanAdd", async (user) => {
    const Premium = require("../../schemas/Premium");
    const masters = await Premium.findOne({ guildId: user.guild.id });
      if (masters && client.user.id !== masters._id) return;
    
    const owner = await user.guild.fetchOwner();
    if (await client.guild.findById(user.guild.id)) {
      const guild = await client.guild.findById(user.guild.id)
      if (guild.logs.banned) {
        if (await guild.logs.banned.toggle === "true") {
          let channell = user.guild.channels.cache.get(await guild.logs.banned.channel);
          const logs = await user.guild.fetchAuditLogs({ limit: 1, type: Discord.AuditLogEvent.MemberBanAdd, }).catch(console.error);
          if (logs) {
            const log = logs.entries.first();
            const executor = log.executor;
            if (channell) {
              const exampleEmbed = new Discord.EmbedBuilder()
                .setColor(color)
                .setThumbnail(executor.avatarURL())
                .setTitle(`Ban Add By ${executor.username}`)
                .addFields(
                  { name: `**Ban Add By :**`, value: `[ **${executor}** ]`, inline: true },
                  { name: `**Banned :**`, value: `[ **${user.user}** ]`, inline: true },
                  { name: `**Reason :**`, value: `**\`No Reason\`**`, inline: true },
                )
                .setTimestamp();
              channell.send({ embeds: [exampleEmbed] })
            }
          }
        }
      }


      if (guild.protection.antihack == "true") {

        const logsFinds = await user.guild.fetchAuditLogs({ limit: 1, type: Discord.AuditLogEvent.MemberBanAdd, }).catch(console.error);
        const logsFind = logsFinds.entries.first();
        const executorFind = logsFind.executor;

        if (executorFind !== owner.user && executorFind.id !== client.user.id && !guild.trust.includes(executorFind.id)) {
          await user.guild.fetchAuditLogs().then(logs => {
            let actions = logs.entries
              .filter(e => e.action === Discord.AuditLogEvent.MemberBanAdd && e.executor.id === executorFind.id && (e.createdAt - Date.now()) < 86400000)

            let limit = guild.limit.bans || 5;
            if (actions.size > parseInt(limit) || actions.size == parseInt(limit)) {

              // None
              if(!guild.action.bans || guild.action.bans === "none") return;

              // Roles
              if(guild.action.bans === "roles") {
                const member = user.guild.members.cache.get(executorFind.id)
                const roles = member.roles.cache;
                  member.roles.remove(roles);

                if(guild.notification && guild.notification === "true") {
                  const exampleEmbed = new Discord.EmbedBuilder()
                    .setColor(color)
                    .setThumbnail(executorFind.avatarURL())
                    .setTitle(`Counter an attack by: ${executorFind.username}`)
                    .addFields(
                      { name: `**Action :**`, value: `[** Ban Limit **]`, inline: true },
                      { name: `**Reply :**`, value: `[** Remove all member Roles **]`, inline: true },
                      { name: `**Limit :**`, value: `**\`${actions.size}/${limit}\`**`, inline: true },
                    )
                    .setTimestamp();
                  owner.user.send({ embeds: [exampleEmbed] })
                }

              }

              // Kick 
              if(guild.action.bans === "kick") {
                user.guild.members.kick(executorFind.id, { reason: 'Failed attempt to sabotage the server ..' }).then(() => {
                  if(guild.notification && guild.notification === "true") {
                    const exampleEmbed = new Discord.EmbedBuilder()
                      .setColor(color)
                      .setThumbnail(executorFind.avatarURL())
                      .setTitle(`Counter an attack by: ${executorFind.username}`)
                      .addFields(
                        { name: `**Action :**`, value: `[** Ban Limit **]`, inline: true },
                        { name: `**Reply :**`, value: `[** Mamber Kicked **]`, inline: true },
                        { name: `**Limit :**`, value: `**\`${actions.size}/${limit}\`**`, inline: true },
                      )
                      .setTimestamp();
                    owner.user.send({ embeds: [exampleEmbed] })
                  }
                })
              }

              // Ban 
              if(guild.action.bans === "ban") {
                user.guild.members.ban(executorFind.id, { days: 7, reason: 'Failed attempt to sabotage the server .. 7 days ban ..' }).then(() => {
                  if(guild.notification && guild.notification === "true") {
                    const exampleEmbed = new Discord.EmbedBuilder()
                      .setColor(color)
                      .setThumbnail(executorFind.avatarURL())
                      .setTitle(`Counter an attack by: ${executorFind.username}`)
                      .addFields(
                        { name: `**Action :**`, value: `[** Ban Limit **]`, inline: true },
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
  client.on("guildBanRemove", async (user) => {
    const Premium = require("../schemas/Premium");
    const masters = await Premium.findOne({ guildId: user.guild.id });
      if (masters && client.user.id !== masters._id) return;
    
    const owner = await user.guild.fetchOwner();
    if (await client.guild.findById(user.guild.id)) {
      const guild = await client.guild.findById(user.guild.id)
      if (guild.logs.banned) {
        if (await guild.logs.banned.toggle === "true") {
          let channell = user.guild.channels.cache.get(await guild.logs.banned.channel);
          const logs = await user.guild.fetchAuditLogs({ limit: 1, type: Discord.AuditLogEvent.MemberBanRemove, }).catch(console.error);
          if (logs) {
            const log = logs.entries.first();
            const executor = log.executor;
            if (channell) {
              const exampleEmbed = new Discord.EmbedBuilder()
                .setColor(color)
                .setThumbnail(executor.avatarURL())
                .setTitle(`Ban Remove By ${executor.username}`)
                .addFields(
                  { name: `**Ban Remove By :**`, value: `[ **${executor}** ]`, inline: true },
                  { name: `**Member :**`, value: `[ **${user.user}** ]`, inline: true },
                  { name: `**Reason :**`, value: `**\`"No Reason"\`**`, inline: true },
                )
                .setTimestamp();
              channell.send({ embeds: [exampleEmbed] })
            }
          }
        }
      }
    }
  });
};