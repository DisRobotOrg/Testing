const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db')
const ms = require('ms')
const { ButtonStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  name: "hide_all",
  description: "To hide channels",
  type: ApplicationCommandType.ChatInput,
  usage: 'hide_all',
  admin: true,
  master: true,
  run: async (client, interaction, args, Discord, emoji, color, discordCode) => {
    const owner = await interaction.guild.fetchOwner();
    let langD = await Guild.findById(interaction.guild.id);
    let lang = client.replys.ar;
    if (langD) {
      if (langD.language) {
        lang = client.replys[langD.language]
      }
    }
    if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageChannels)) return interaction.followUp({ content: `${lang.permErr}` });

    interaction.guild.channels.fetch().then(channels => {
      channels.forEach(channel => {
        channel.permissionOverwrites.set([
          {
            id: interaction.guild.id,
            deny: [Discord.PermissionsBitField.Flags.ViewChannel],
          },
        ]);
      })
      interaction.followUp(`${lang.hide_all.done.replace(/\[channels]/g,`${channels.size}`)}`)
    })
  },
};