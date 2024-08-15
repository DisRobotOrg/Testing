const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db');
//const Canvas = require("canvas");
const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require("fs")
/*
module.exports = {
  name: "colors",
  description: "Get user avatar",
  type: ApplicationCommandType.ChatInput,
  usage: 'avatar `user:[user]`',
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
    if (langD) {
      if (langD.language) {
        lang = client.replys[langD.language]
      }
    }


    var { Canvas } = require("canvas-constructor/napi-rs");
    let x = 0;
    let y = 0;
    if (interaction.guild.roles.cache.filter(role => !isNaN(role.name)).size <= 0) return;
    interaction.guild.roles.cache
      .filter(role => !isNaN(role.name))
      .sort((b1, b2) => b1.name - b2.name)
      .forEach(() => {
        x += 100;
        if (x > 100 * 12) {
          x = 100;
          y += 80;
        }
      });
    var image = "https://images-ext-1.discordapp.net/external/TN6tm7MtqvAOQMWxeHkcusSN1ne9PZrGY1_ai6TtmiE/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/919931389346975744/69181ea7f008fde33cab14c5c85e04cf.webp?width=565&height=565";
    var xd = new Canvas(100 * 11, y + 350)
      .addBeveledImage(image, 0, 0, 100 * 11, y + 350, 100)
      .setTextBaseline("middle")
      .setColor("white")
      .setTextSize(60)
      .addText(`قائمة الألوان`, 375, 40);
    x = 0;
    y = 150;
    interaction.guild.roles.cache
      .filter(role => !isNaN(role.name))
      .sort((b1, b2) => b1.name - b2.name)
      .forEach(role => {
        x += 75;
        if (x > 100 * 10) {
          x = 75;
          y += 80;
        }
        xd.setTextBaseline("middle")
          .setTextAlign("center")
          .setColor(role.hexColor)
          .addBeveledRect(x, y, 60, 60, 15)
          .setColor("white");
        if (`${role.name}`.length > 2) {
          xd.setTextSize(30);
        } else if (`${role.name}`.length > 1) {
          xd.setTextSize(40);
        } else {
          xd.setTextSize(50);
        }
        xd.addText(role.name, x + 30, y + 30);
      });

    const attachment = new Discord.AttachmentBuilder(xd.toBuffer(), 'colors.png');

    interaction.followUp({ files: [attachment] });



  },
};
*/