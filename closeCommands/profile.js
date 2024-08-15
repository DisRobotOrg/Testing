const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db');
const Canvas = require("canvas");
const { ButtonStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
/*
module.exports = {
  name: "profile",
  description: "Get user profile",
  type: ApplicationCommandType.ChatInput,
  usage: 'profile `user:[user]`',
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionType.User,
      description: "To show any user profile",
      required: false
    }
  ],

  run: async (client, interaction, args, Discord, emoji, color, discordCode) => {

    let user = interaction.options.getUser('user') || interaction.user;
    
    const key = `level-${user.id}`;
    let points = client.db.get(key) ? client.db.get(key, `level`) : 1;
    
    let des = db.fetch(`description_${user.id}`);
    if (!des) des = 'Set Your Description';

    let guilds = 0;

    let coins = 0;

    const canvas = Canvas.createCanvas(1080, 1080);
    Canvas.registerFont('./Akira-Expanded-Demo.otf', { family: 'Akira' });
    const ctx = canvas.getContext('2d');
    let prime = db.fetch(`prime_${user.id}`)



    const background = await Canvas.loadImage(emoji.profileCard);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    function kFormatter(num) {
      return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k' : Math.sign(num)*Math.abs(num)
    }

    function numberFormater(num) {
      var str = "" + num
      var pad = "00"
      return pad.substring(0, pad.length - str.length) + str
    }
    
    //UserName
    ctx.font = ctx.measureText(user.username).width > 400 ? "30px Akira" : "50px Akira";
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = "start";
    ctx.fillText(user.username, 495, 250, 491);

    //description
    ctx.font = '25px Akira';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = "start";
    ctx.fillText(`${des}`, 495, 430, 491);

    //level
    ctx.font = '40px Akira';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = "center";
    ctx.fillText(numberFormater(parseInt(points)), 243, 641);

    //guilds
    ctx.font = '40px Akira';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = "center";
    ctx.fillText(numberFormater(parseInt(guilds)), 243, 803);

    //coins
    ctx.font = '40px Akira';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = "center";
    ctx.fillText(kFormatter(parseInt(coins)), 243, 963);


    const avatar = await Canvas.loadImage(user.displayAvatarURL({ dynamic: true, extension: 'png' }));
    ctx.save();
    roundedImage(18,30,380,380,115);
    ctx.clip();
    ctx.drawImage(avatar, 19, 32, 380, 380);


    function roundedImage(x,y,width,height,radius){
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }


    const attachment = new Discord.AttachmentBuilder(canvas.toBuffer(), 'profile.png');

    await interaction.followUp({ files: [attachment] });



  },
};
*/