const Discord = require("discord.js");
module.exports = async (client) => {
  const color = client.config.color
  
  client.on("messageUpdate" , async (oldMessage, newMessage) => {
    const Premium = require("../../schemas/Premium");
    const masters = await Premium.findOne({ guildId: oldMessage.guild.id });
      if (masters && client.user.id !== masters._id) return;
    
      if(oldMessage.author.bot) return;
          if(await client.guild.findById(oldMessage.guild.id)) {
              const guild = await client.guild.findById(oldMessage.guild.id)
              if(await guild.logs.message.toggle === "true") {
                  let channel = oldMessage.guild.channels.cache.get(await guild.logs.message.channel);
                  if(channel){
                      const exampleEmbed = new Discord.EmbedBuilder()
                          .setColor(color)
                          .setThumbnail(oldMessage.author.avatarURL())
                          .setTitle(`${oldMessage.author.username} Edit Message`)
                          .addFields(
                              { name: `**Message Edited by :**`, value: `[ **${oldMessage.author}** ]`, inline: true },
                              { name: `**Message Channel :**`, value: `[ **${oldMessage.channel}** ]`, inline: true },
                              { name: `**Old Message :**`, value: `**\`\`\`${oldMessage}\`\`\`**`, inline: false },
                              { name: `**New Message :**`, value: `**\`\`\`${newMessage.content}\`\`\`**`, inline: false },
                          )
                          .setTimestamp();
                      channel.send({ embeds:[exampleEmbed] })
                  }
              }
          }
  });

};