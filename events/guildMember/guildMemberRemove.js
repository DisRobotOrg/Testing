const Discord = require("discord.js");
module.exports = async (client) => {
  const color = client.config.color
  const moment = require('moment');
  
  client.on("guildMemberRemove", async (user, member) => {
    const Premium = require("../../schemas/Premium");
    const masters = await Premium.findOne({ guildId: user.guild.id });
      if (masters && client.user.id !== masters._id) return;
    
    const owner = await user.guild.fetchOwner();
    if (await client.guild.findById(user.guild.id)) {
      const guild = await client.guild.findById(user.guild.id)
      if (guild.logs.kick) {
        if (await guild.logs.kick.toggle === "true") {
          let channell = user.guild.channels.cache.get(await guild.logs.kick.channel);
          const logs = await user.guild.fetchAuditLogs({ limit: 1, type: Discord.AuditLogEvent.MemberKick, }).catch(console.error);
          if (logs) {
            const log = logs.entries.first();
            const executor = log.executor;
            /*if (channell && log.createdAt > member.joinedAt) {
              const exampleEmbed = new Discord.EmbedBuilder()
                .setColor(color)
                .setThumbnail(executor.avatarURL())
                .setTitle(`Kick By ${executor.username}`)
                .addFields(
                  { name: `**Kick By :**`, value: `[ **${executor}** ]`, inline: true },
                  { name: `**Member :**`, value: `[ **${user.user}** ]`, inline: true },
                  { name: `**Reason :**`, value: `**\`No Reason\`**`, inline: true },
                )
                .setTimestamp();
              channell.send({ embeds: [exampleEmbed] })
            }*/
          }
        }
      }
      if (guild.logs.leaves) {
        if (await guild.logs.leaves.toggle === "true") {
          let channell = user.guild.channels.cache.get(await guild.logs.leaves.channel);
          if (channell) {
            const exampleEmbed = new Discord.EmbedBuilder()
              .setColor(color)
              .setThumbnail(user.user.avatarURL())
              .setTitle(`${user.user.username} Leave The guild`)
              .addFields(
                { name: `**Member :**`, value: `[ **${user.user}** ]`, inline: true },
                { name: `**Member ID :**`, value: `[ **${user.user.id}** ]`, inline: true },
                { name: `**Created at :**`, value: `**${moment(user.user.createdAt).format('MMM DD YYYY')}**`, inline: false },
              )
              .setTimestamp();
            channell.send({ embeds: [exampleEmbed] })
          }
        }
      }
  
  
      /*if (guild.protection.antihack == "true") {
  
        const logsFinds = await user.guild.fetchAuditLogs({ limit: 1, type: Discord.AuditLogEvent.MemberKick, }).catch(console.error);
        const logsFind = logsFinds.entries.first();
        const executorFind = logsFind.executor;
  
        if (executorFind !== owner.user && executorFind.id !== client.user.id && !guild.trust.includes(executorFind.id)) {
          await user.guild.fetchAuditLogs().then(logs => {
            let actions = logs.entries
              .filter(e => e.action === Discord.AuditLogEvent.MemberKick && e.executor.id === executorFind.id && (e.createdAt - Date.now()) < 86400000)
  
            let limit = guild.limit.kicks || 5;
            if (actions.size > parseInt(limit) || actions.size == parseInt(limit)) {
              user.guild.members.ban(executorFind.id, { days: 7, reason: 'Failed attempt to sabotage the server .. 7 days ban ..' }).then(() => {
                const exampleEmbed = new Discord.EmbedBuilder()
                  .setColor(color)
                  .setThumbnail(executorFind.avatarURL())
                  .setTitle(`Counter an attack by: ${executorFind.username}`)
                  .addFields(
                    { name: `**Action :**`, value: `[** MemberKick Limit **]`, inline: true },
                    { name: `**Reply :**`, value: `[** Mamber Banned **]`, inline: true },
                    { name: `**Limit :**`, value: `**\`${actions.size}/${limit}\`**`, inline: true },
                  )
                  .setTimestamp();
                owner.user.send({ embeds: [exampleEmbed] })
              })
  
            }
  
          })
        }
      }*/
  
    }
  });
};