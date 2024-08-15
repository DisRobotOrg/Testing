const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db');
const Canvas = require("canvas");
const moment = require("moment")
const { ButtonStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: "server",
    description: "Get server info",
    type: ApplicationCommandType.ChatInput,
    usage: 'server',
    run: async (client, interaction, args, Discord, emoji, color, discordCode) => {
        let langD = await Guild.findById(interaction.guild.id);
        let lang = client.replys.ar;
        if(langD) {
            if(langD.language) {
                lang = client.replys[langD.language]
            }
        }

        const text = interaction.guild.channels.cache.filter(r => r.type === "text").size
        const voice = interaction.guild.channels.cache.filter(r => r.type === "voice").size
        const chs = interaction.guild.channels.cache.size
        const avaibles = interaction.guild.features.map(features => features.toString()).join("\n")
        const owner = await interaction.guild.fetchOwner();
        const regions = {
          
        brazil: 'Brazil', EUROPE: 'Europe', hongkong: 'Hong Kong', india: 'India', japan: 'Japan', russia: 'Russia', singapore: 'Singapore', southafrica: 'South Africa', sydeny: 'Sydeny', 'us-central': 'US Central','us-east': 'US Eastside','us-west': 'US Westside','us-south': 'US Southside'};
 
        const roles = interaction.guild.roles.cache.size
 
        //const online = interaction.guild.members.cache.filter(m => m.presence.status === 'online').size;

        const black = new Discord.EmbedBuilder()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setColor(color)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 1024 }))
            .addFields({
                name: `🆔 ${lang.server.id.title}`,
                value: `${interaction.guild.id}`,
                inline: true
 
            }, {
                name: `📆 ${lang.server.created.title}`,
                value: moment(interaction.guild.createdAt, "YYYYMMDD").fromNow(),
                inline: true
            }, {
                name: `👑 ${lang.server.owner.title}`,
                value: `${owner.user}`,
                inline: true
 
            }, {
                name: `👥 ${lang.server.members.title} (${interaction.guild.memberCount})`,
                value: `**${interaction.guild.premiumSubscriptionCount}** ${lang.server.members.boosts} ✨`,
                inline: true
            }, {
                name: `💬 ${lang.server.channels.title} (${chs})`,
                value: `**${text}** ${lang.server.channels.text} | **${voice}** ${lang.server.channels.voice}`,
                inline: true
            }, {
                name: `🌍 ${lang.server.other.title}`,
                value: `**${lang.server.other.info}:** ${regions[interaction.guild.region]}`,
                inline: true
            }, )
            .setFooter({ text: client.user.username, iconURL: client.user.avatarURL() })

        interaction.followUp({ embeds: [black] });
        


    },
};
