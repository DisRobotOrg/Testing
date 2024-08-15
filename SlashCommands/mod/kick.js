const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db')
const { ButtonStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  name: "kick",
  description: "To kick user from server",
  type: ApplicationCommandType.ChatInput,
  usage: 'kick `user:[user]` `reason:[reason]`',
  admin: true,
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionType.User,
      description: "Choose the user !",
      required: true
    },
    {
      name: 'reason',
      type: ApplicationCommandOptionType.String,
      description: "Type the reason !",
      required: false
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

    const member = interaction.options.getMember('user');
    if (!member) return interaction.followUp(`${lang.kick.choose}`);
    if (member.user.id == client.user.id) return interaction.followUp({ content: `${lang.kick.me}` });

    if (
      interaction.user.id !== owner.user.id && member.roles.highest.position >= interaction.member.roles.highest.position
    ) return interaction.followUp(`${lang.kick.choose}`)

    const reason = interaction.options.getString('reason') || "No reason!";

    if (interaction.guild.members.me.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
      interaction.guild.members.kick(member).then(() => {
        interaction.followUp(`${lang.kick.done.replace(/\[user]/g,`${member}`)}`);
      }).catch((err) => {
        interaction.followUp({ content: lang.err.replace(/\[support]/g, `https://discord.gg/${discordCode} - **Code Error** : \`MISSING PERMISSIONS\``), ephemeral: true })
      })

    } else {
      interaction.followUp({ content: lang.err.replace(/\[support]/g, `https://discord.gg/${discordCode} - **Code Error** : \`MISSING PERMISSIONS\``), ephemeral: true })
    }
  },
};