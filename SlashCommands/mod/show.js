const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db')
const ms = require('ms')
const { ButtonStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  name: "show",
  description: "To show channel",
  type: ApplicationCommandType.ChatInput,
  usage: 'show `channel:[channel]`',
  admin: true,
  options: [
    {
      name: 'channel',
      description: 'provide channel which you want to show',
      type: ApplicationCommandOptionType.Channel,
      required: false,
    }
  ],
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

    const channel = interaction.options.getChannel('channel') || interaction.channel;
    if (channel.permissionsFor(interaction.guild.id).has(Discord.PermissionsBitField.Flags.ViewChannel)) {
      interaction.followUp(`${lang.show.err}`)
    } else {
      channel.permissionOverwrites.set([
        {
          id: interaction.guild.id,
          allow: [Discord.PermissionsBitField.Flags.ViewChannel],
        },
      ]);
      interaction.followUp(`${lang.show.done}`)
    }

  },
};