const Discord = require("discord.js");
module.exports = async (client) => {
  const color = client.config.color
  
  client.on("messageDelete" , async (message) => {
    const Premium = require("../../schemas/Premium");
    const masters = await Premium.findOne({ guildId: message.guild.id });
      if (masters && client.user.id !== masters._id) return;
    
          if(await client.guild.findById(message.guild.id)) {
              const guild = await client.guild.findById(message.guild.id)
              if(await guild.logs.message.toggle === "true") {
                      const logs = await message.guild.fetchAuditLogs({
                                          limit: 1,
                                          type: Discord.AuditLogEvent.MessageDelete,
                                      }).catch(console.error);
                      if(logs){
                          const log = logs.entries.first();
                          if(log) {
                              const executor = log.executor;
                               let channel = message.guild.channels.cache.get(await guild.logs.message.channel);
                              if(channel){
                                  const exampleEmbed = new Discord.EmbedBuilder()
                                      .setColor(color)
                                      .setThumbnail(message.author.avatarURL())
                                      .setTitle(`${executor.username} Deleted Message`)
                                      .addFields(
                                          { name: `**Message deleted from :**`, value: `[ **${message.author}** ]`, inline: true },
                                          { name: `**Message deleted By :**`, value: `[ **${executor}** ]`, inline: true },
                                          { name: `**Message Channel :**`, value: `[ **${message.channel}** ]`, inline: true },
                                          { name: `**Content :**`, value: `**\`\`\`${message.content}\`\`\`**`, inline: false },
                                      )
                                      .setTimestamp();
                                  channel.send({ embeds:[exampleEmbed] })}
                          } else {
                              let channel = message.guild.channels.cache.get(await guild.logs.message.channel);
                              if(channel){
                                  const exampleEmbed = new Discord.EmbedBuilder()
                                      .setColor(color)
                                      .setThumbnail(message.author.avatarURL())
                                      .setTitle(`${message.author.username} Deleted Message`)
                                      .addFields(
                                          { name: `**Message deleted from :**`, value: `[ **${message.author}** ]`, inline: true },
                                          { name: `**Message Channel :**`, value: `[ **${message.channel}** ]`, inline: true },
                                          { name: `**Content :**`, value: `**\`\`\`${message.content}\`\`\`**`, inline: false },
                                      )
                                      .setTimestamp();
                                  channel.send({ embeds:[exampleEmbed] })
                              }
                          }
                      } else {
                          let channel = message.guild.channels.cache.get(await guild.logs.message.channel);
                          if(channel){
                              const exampleEmbed = new Discord.EmbedBuilder()
                                  .setColor(color)
                                  .setThumbnail(message.author.avatarURL())
                                  .setTitle(`${message.author.username} Deleted Message`)
                                  .addFields(
                                      { name: `**Message deleted from :**`, value: `[ **${message.author}** ]`, inline: true },
                                      { name: `**Message Channel :**`, value: `[ **${message.channel}** ]`, inline: true },
                                      { name: `**Content :**`, value: `**\`\`\`${message.content}\`\`\`**`, inline: false },
                                  )
                                  .setTimestamp();
                              channel.send({ embeds:[exampleEmbed] })
                          }
                  }
              }
          }
  });
};