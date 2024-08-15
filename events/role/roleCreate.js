const Discord = require("discord.js");
module.exports = async (client) => {
  const color = client.config.color
  
  client.on("roleCreate", async (role) => {
    const Premium = require("../../schemas/Premium");
    const masters = await Premium.findOne({ guildId: role.guild.id });
      if (masters && client.user.id !== masters._id) return;
    
    const owner = await role.guild.fetchOwner();
    if (await client.guild.findById(role.guild.id)) {
      const guild = await client.guild.findById(role.guild.id)
      if (guild.logs.role) {
        if (await guild.logs.role.toggle === "true") {
          let channell = role.guild.channels.cache.get(await guild.logs.role.channel);
          const logs = await role.guild.fetchAuditLogs({ limit: 1, type: Discord.AuditLogEvent.RoleCreate, }).catch(console.error);
          if (logs) {
            const log = logs.entries.first();
            const executor = log.executor;
            if (channell) {
              const exampleEmbed = new Discord.EmbedBuilder()
                .setColor(color)
                .setThumbnail(executor.avatarURL())
                .setTitle(`Role Created By ${executor.username}`)
                .addFields(
                  { name: `**Role Created By :**`, value: `[ **${executor}** ]`, inline: true },
                  { name: `**Role :**`, value: `[ **${role}** ]`, inline: true },
                  { name: `**Reason :**`, value: `**\`No Reason\`**`, inline: true },
                )
                .setTimestamp();
              channell.send({ embeds: [exampleEmbed] })
            }
          }
        }
      }

      if (await guild.autorestore.roles === "true") {
        const logs = await role.guild.fetchAuditLogs().catch(console.error);
        if (logs) {
          const log = logs.entries.find(l => l.action === Discord.AuditLogEvent.RoleCreate);
          const executor = log.executor;
          if (executor !== owner.user && executor.id !== client.user.id && !guild.trust.includes(executor.id)) {
            role.delete()
          }
        }
      }
  
      
      if (guild.protection.antihack == "true") {
  
        const logsFinds = await role.guild.fetchAuditLogs({ limit: 1, type: Discord.AuditLogEvent.RoleCreate, }).catch(console.error);
        const logsFind = logsFinds.entries.first();
        const executorFind = logsFind.executor;
  
        if (executorFind !== owner.user && executorFind.id !== client.user.id && !guild.trust.includes(executorFind.id)) {
          await role.guild.fetchAuditLogs().then(logs => {
            let actions = logs.entries
              .filter(e => e.action === Discord.AuditLogEvent.RoleCreate && e.executor.id === executorFind.id && (e.createdAt - Date.now()) < 86400000)
  
            let limit = guild.limit.roles || 5;
            if (actions.size > parseInt(limit) || actions.size == parseInt(limit)) {

              // None
              if(!guild.action.roles || guild.action.roles === "none") return;

              // Roles
              if(guild.action.roles === "roles") {
                const member = role.guild.members.cache.get(executorFind.id)
                const roles = member.roles.cache;
                  member.roles.remove(roles);

                if(guild.notification && guild.notification === "true") {
                  const exampleEmbed = new Discord.EmbedBuilder()
                    .setColor(color)
                    .setThumbnail(executorFind.avatarURL())
                    .setTitle(`Counter an attack by: ${executorFind.username}`)
                    .addFields(
                      { name: `**Action :**`, value: `[** RoleCreate Limit **]`, inline: true },
                      { name: `**Reply :**`, value: `[** Remove all member Roles **]`, inline: true },
                      { name: `**Limit :**`, value: `**\`${actions.size}/${limit}\`**`, inline: true },
                    )
                    .setTimestamp();
                  owner.user.send({ embeds: [exampleEmbed] })
                }

              }

              // Kick 
              if(guild.action.roles === "kick") {
                role.guild.members.kick(executorFind.id, { reason: 'Failed attempt to sabotage the server ..' }).then(() => {
                  if(guild.notification && guild.notification === "true") {
                    const exampleEmbed = new Discord.EmbedBuilder()
                      .setColor(color)
                      .setThumbnail(executorFind.avatarURL())
                      .setTitle(`Counter an attack by: ${executorFind.username}`)
                      .addFields(
                        { name: `**Action :**`, value: `[** RoleCreate Limit **]`, inline: true },
                        { name: `**Reply :**`, value: `[** Mamber Kicked **]`, inline: true },
                        { name: `**Limit :**`, value: `**\`${actions.size}/${limit}\`**`, inline: true },
                      )
                      .setTimestamp();
                    owner.user.send({ embeds: [exampleEmbed] })
                  }
                })
              }

              // Ban 
              if(guild.action.roles === "ban") {
                role.guild.members.ban(executorFind.id, { days: 7, reason: 'Failed attempt to sabotage the server .. 7 days ban ..' }).then(() => {
                  if(guild.notification && guild.notification === "true") {
                    const exampleEmbed = new Discord.EmbedBuilder()
                      .setColor(color)
                      .setThumbnail(executorFind.avatarURL())
                      .setTitle(`Counter an attack by: ${executorFind.username}`)
                      .addFields(
                        { name: `**Action :**`, value: `[** RoleCreate Limit **]`, inline: true },
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