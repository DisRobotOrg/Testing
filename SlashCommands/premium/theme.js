const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db')
const { ButtonStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const Premium = require("../../schemas/Premium");

module.exports = {
  name: "theme",
  description: "To change server premium bot theme",
  usage: 'theme `theme:[cayan/red/yellow]`',
  type: ApplicationCommandType.ChatInput,
  master: true,
  options: [
    {
      name: 'theme',
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          value: 'cayan',
          name: 'Cayan',
        },
        {
          value: 'red',
          name: 'Red',
        },
        {
          value: 'yellow',
          name: 'Yellow',
        }
      ],
      description: "Choose the theme .. !",
      required: true
    }
  ],

  run: async (client, interaction, args, Discord, emoji, color, discordCode) => {
    let langD = await Guild.findById(interaction.guild.id);
    let lang = client.replys.ar;
    if (langD) {
      if (langD.language) {
        lang = client.replys[langD.language]
      }
    }


    if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) return await interaction.followUp({ content: `${lang.permErr}`, ephemeral: true });

    await Premium.findByIdAndUpdate(client.user.id, {
      theme: interaction.options.getString('theme')
    })

    interaction.followUp({ content: `${lang.theme.done.replace(/\[theme]/g, interaction.options.getString('theme').charAt(0).toUpperCase() + interaction.options.getString('theme').slice(1))}` })
  },
};