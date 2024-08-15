const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db');
const Canvas = require("canvas");
const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: "avatar",
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
        if(langD) {
            if(langD.language) {
                lang = client.replys[langD.language]
            }
        }

        
        let member = interaction.options.getUser('user') || interaction.user ;

        const embed = new Discord.EmbedBuilder()
            .setColor(color)
            .setTitle(`${member.username} ${lang.avatar.title}`)
            .setDescription(`[PNG](${member.displayAvatarURL({ format: "png", size: 1024 })}) | [JPG](${member.displayAvatarURL({ format: "jpg", size: 1024 })}) | [GIF](${member.displayAvatarURL({ format: "gif", size: 1024, dynamic: true })}) | [WEBP](${member.displayAvatarURL({ format: "webp", size: 1024 })})`)
            .setImage(member.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.avatarURL({ dynamic: true, size: 1024 }) })
            .setTimestamp()

        const row = new Discord.ActionRowBuilder()
			.addComponents(
				new Discord.ButtonBuilder()
					.setLabel(lang.avatar.button)
					.setStyle(ButtonStyle.Link)
                    .setURL(`${member.displayAvatarURL({ format: "webp", size: 1024 })}`)
                    .setEmoji(emoji.linkID)
			);
interaction.reply({content: `hmmm.`, embeds: [embed], components: [row] });
    },
};
