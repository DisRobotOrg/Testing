const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db')
const { GuildMemberManager, ButtonStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const Premium = require("../../schemas/Premium");

module.exports = {
  name: "setusername",
  description: "To change premium bot username",
  type: ApplicationCommandType.ChatInput,
  usage: 'setusername `username:[username]`',
  admin: true,
  master: true,
  options: [
    {
      name: 'username',
      type: ApplicationCommandOptionType.String,
      description: "Type the new username !",
      required: true
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
    if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) return await interaction.followUp({ content: `${lang.permErr}`, ephemeral: true });

    const username = interaction.options.getString('username');

    client.user.setUsername(username)
      .then(async () => {
        await Premium.findByIdAndUpdate(client.user.id, {
          username: username
        })
        interaction.followUp({ content: `${lang.setusername.done}` })
      })
      .catch(err => {
        interaction.followUp({ content: `${lang.setusername.err}` })
      });
  },
};