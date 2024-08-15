const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db');
const Canvas = require("canvas");
const moment = require("moment")
const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: "user",
  description: "Get user info",
  usage: 'user `user:[user]`',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionType.User,
      description: "To show any user avatar",
      required: false
    }
  ],

  run: async (client, interaction, args, Discord, emoji, color, discordCode) => {
    let langD = await Guild.findById(interaction.guild.id);
    let lang = client.replys.ar;
    if(langD) {
        if(langD.language) {
            lang = client.replys[langD.language]
        }
    }
    
    let user = interaction.options.getMember('user') || interaction.member;

    let userembed = new Discord.EmbedBuilder()
      .setColor(color)
      .setThumbnail(user.user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setAuthor({ name: user.user.username, iconURL: user.user.displayAvatarURL({ dynamic: true }) })
      .addFields(
        { name: `${lang.user.discord} :`, value: `**<t:${moment(user.user.createdTimestamp).unix()}:R>**`, inline: true },
        { name: `${lang.user.server} :`, value: `**<t:${moment(user.joinedAt).unix()}:R>**`, inline: true },
      )
      .setFooter({ text: `${user.user.tag} `, iconURL: user.user.displayAvatarURL({ dynamic: true }) })

    const row = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.ButtonBuilder()
          .setLabel(lang.user.button)
          .setStyle(ButtonStyle.Link)
          .setURL(`${user.user.displayAvatarURL({ format: "webp", size: 1024 })}`)
          .setEmoji(emoji.linkID)
      );
return await interaction.reply({ embeds: [userembed], components: [row] });

  },
};
