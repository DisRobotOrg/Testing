const Discord = require("discord.js");
module.exports = async (client) => {
  client.on("guildMemberAdd" , async (member) => {
    const Premium = require("../../schemas/Premium");
    const masters = await Premium.findOne({ guildId: member.guild.id });
      if (masters && client.user.id !== masters._id) return;
    
    // Welcomer :
    const guildFinder = await client.guild.findById(member.guild.id)
    if(guildFinder) {
      if(guildFinder.welcome) {
        if(guildFinder.welcome.toggle == "true") {
          if(guildFinder.welcome.channel) {
            let embed = new Discord.EmbedBuilder()
              .setColor(client.config.color)
              .setTitle("👋 Welcome!")
              .setFooter({ text: `Server: ${member.guild.name}`, iconURL: member.displayAvatarURL({ dynamic: true, size: 1024 }) })
              .setDescription(`Welcome to **${member.guild.name}** ${member}!`)
              .setTimestamp()
              .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 1024 }));
      
            const channel = member.guild.channels.cache.get(guildFinder.welcome.channel);
            if(channel) {
              channel.send({ embeds: [embed] })
            }
          }
        }
      }
    }
  });
};