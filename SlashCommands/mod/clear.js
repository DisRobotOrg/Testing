const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db')
const ms = require('ms')
const { ButtonStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  name: "clear",
  description: "To clear messages",
  type: ApplicationCommandType.ChatInput,
  usage: 'clear',
  admin: true,
  options: [
    {
      name: 'amount_of_messages',
      type: ApplicationCommandOptionType.Number,
      description: "Type the number of messages",
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

    const number = interaction.options.getNumber('amount_of_messages');
    if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageMessages)) return interaction.followUp({ content: `${lang.permErr}` });

    interaction.channel.messages.fetch({
      limit: number // Change `100` to however many messages you want to fetch
    }).then((messages) => {
      const botMessages = [];
      messages.filter(m => m !== interaction.channel.lastMessage).forEach(msg => botMessages.push(msg))
      interaction.channel.bulkDelete(botMessages).then(messages => {
        interaction.followUp({ content: `${lang.clear.done.replace(/\[messages]/g,`${messages.size}`)}` }).then(() => {
          setTimeout(() => {
            interaction.deleteReply()
          }, 3000)
        })
      });
    })


  },
};