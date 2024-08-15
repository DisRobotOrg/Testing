const Discord = require("discord.js");
module.exports = async (client) => {  
  client.on('guildDelete', guild => {
    const Logs = client.config.idGuildLeave
  
    // const embed = new Discord.EmbedBuilder()
    //   .setTitle("I Was Removed From a Guild :c")
    //   .addField("Guild Name", `${guild.name}`)
    //   .addField("Guild Members", `${guild.members.cache.size}`)
    //   .addField("Guild Id", `${guild.id}`)
    //   .addField("Guild Owner", `<@${guild.ownerID}> | Id: ${guild.ownerID}`)
    //   .setFooter(`OnixBot is Currently in ${client.guilds.cache.size}guilds!`)
    //   .setTimestamp()
    //   .setColor(color)
  
    // client.channels.cache.get(Logs).send({ embeds: [embed] })
  })

};