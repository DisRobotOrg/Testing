const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db')
const { GuildMemberManager, ButtonStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const Premium = require("../../schemas/Premium");

module.exports = {
  name: "setavatar",
  description: "To change premium bot avatar",
  type: ApplicationCommandType.ChatInput,
  usage: 'setavatar `avatar:[avatarURL]`',
  admin: true,
  master: true,
  options: [
    {
      name: 'avatar',
      type: ApplicationCommandOptionType.String,
      description: "Put the new avatar link !",
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

    const avatar = interaction.options.getString('avatar');

    client.user.setAvatar(avatar)
      .then(async () => {
        await Premium.findByIdAndUpdate(client.user.id, {
          avatar: avatar
        })
        interaction.followUp({ content: `${lang.setavatar.done}` })
      })
      .catch(err => {
        interaction.followUp({ content: `${lang.setavatar.err}` })
      });
  },
};