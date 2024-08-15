const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db')
const { GuildMemberManager, ButtonStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const Premium = require("../../schemas/Premium");

module.exports = {
  name: "setstatus",
  description: "To change premium bot activity",
  type: ApplicationCommandType.ChatInput,
  usage: 'setstatus `activity:[activityURL]`',
  admin: true,
  master: true,
  options: [
    {
      name: 'activity',
      type: ApplicationCommandOptionType.String,
      description: "Put the new activity link !",
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

    const activity = interaction.options.getString('activity');

    client.user.setPresence({ activities: [{ name: activity }], status: "idle" })
        await Premium.findByIdAndUpdate(client.user.id, {
          activity: activity
        })
        interaction.followUp({ content: `${lang.setactivity.done}` })
  },
};