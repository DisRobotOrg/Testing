const Discord = require("discord.js");
module.exports = async (client) => {
  const color = client.config.color

  client.on("roleUpdate", async (role) => {
    const Premium = require("../../schemas/Premium");
    const masters = await Premium.findOne({ guildId: role.guild.id });
    if (masters && client.user.id !== masters._id) return;

    const owner = await role.guild.fetchOwner();
    if (await client.guild.findById(role.guild.id)) {
      const guild = await client.guild.findById(role.guild.id)
      if (guild.logs.role) {
        if (await guild.logs.role.toggle === "true") {
          let channell = role.guild.channels.cache.get(await guild.logs.role.channel);
          const logs = await role.guild.fetchAuditLogs({ limit: 1, type: Discord.AuditLogEvent.RoleUpdate, }).catch(console.error);
          if (logs) {
            const log = logs.entries.first();
            const executor = log.executor;
            if (channell) {
              const exampleEmbed = new Discord.EmbedBuilder()
                .setColor(color)
                .setThumbnail(executor.avatarURL())
                .setTitle(`Role Updated By ${executor.username}`)
                .addFields(
                  { name: `**Updated By :**`, value: `[ **${executor}** ]`, inline: true },
                  { name: `**Role :**`, value: `[ **${role}** ]`, inline: true },
                  { name: `**Reason :**`, value: `**\`No Reason\`**`, inline: true },
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