const Discord = require("discord.js");
module.exports = async (client) => {
  const color = client.config.color
  const moment = require('moment');
  
  client.on("guildMemberAdd" , async (member) => {
    const Premium = require("../../schemas/Premium");
    const masters = await Premium.findOne({ guildId: member.guild.id });
      if (masters && client.user.id !== masters._id) return;
    
      const owner = await member.guild.fetchOwner();
      if(await client.guild.findById(member.guild.id)) {
              // antiBots
              if (member.user.bot) {
                  if(await client.guild.findById(member.guild.id)) {
                      const guild = await client.guild.findById(member.guild.id)
                      //logs
                      if(await guild.logs.guildMemberAdd.toggle === "true") {
                          const logs = await member.guild.fetchAuditLogs({ limit: 1, type: Discord.AuditLogEvent.BotAdd, }).catch(console.error);
                          if(logs){
                              let channel = member.guild.channels.cache.get(await guild.logs.guildMemberAdd.channel);
                              if(channel){
                                  const log = logs.entries.first();
                                  const executor = log.executor;
  
                                  const exampleEmbed = new Discord.EmbedBuilder()
                                      .setColor(color)
                                      .setThumbnail(member.user.avatarURL())
                                      .setTitle(`${executor.username} Added ${member.user.username}`)
                                      .addFields(
                                          { name: `**Moderator :**`, value: `[ **<@${executor.id}>** ]`, inline: true },
                                          { name: `**Moderator ID :**`, value: `[ **\`${executor.id}\`** ]`, inline: true },
                                          { name: `**Bot :**`, value: `[ **<@${member.user.id}>** ]`, inline: true },
                                          { name: `**Bot ID :**`, value: `[ **\`${member.user.id}\`** ]`, inline: true },
                                      )
                                      .setTimestamp();
                                  channel.send({ embeds:[exampleEmbed] })
                              }
                          }
                      }
                      //anti
                      if(await guild.protection.antibot === "true") {
                          const logs = await member.guild.fetchAuditLogs({ limit: 1, type: 'BOT_ADD', }).catch(console.error);
                              if(logs){
                                  const log = logs.entries.first();
                                  if(log) {
                                      const executor = log.executor;
                                      if(executor !== owner.user) {
                                          member.kick();
                                      }
                                  }
                              }
                      }
                  }
              } else {
                  if(await client.guild.findById(member.guild.id)) {
                      const guild = await client.guild.findById(member.guild.id)
                      if(await guild.logs.guildMemberAdd.toggle === "true") {
                          let channel = member.guild.channels.cache.get(await guild.logs.guildMemberAdd.channel);
                          if(channel){
                              const exampleEmbed = new Discord.EmbedBuilder()
                                  .setColor(color)
                                  .setThumbnail(member.user.avatarURL())
                                  .setTitle(`${member.user.username} Joined to Server`)
                                  .addFields(
                                      { name: `**Member :**`, value: `[ **${member.user}** ]`, inline: true },
                                      { name: `**Member ID :**`, value: `[ **${member.user.id}** ]`, inline: true },
                                      { name: `**Created at :**`, value: `**${moment(member.user.createdAt).format('MMM DD YYYY')}**`, inline: false },
                                  )
                                  .setTimestamp();
                              channel.send({ embeds:[exampleEmbed] })
                          }
                      }
                  }
              }
  
          const guild = await client.guild.findById(member.guild.id)
          if(await guild.autorole.toggle === "true") {
              if(await guild.autorole.roles) {
                  var role = member.guild.roles.cache.find(role => role.id === guild.autorole.roles);
                  if(role) {
                      member.roles.add(role).catch(console.error);
                  }
              }
          }
      }
  });

};