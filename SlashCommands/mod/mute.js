const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db')
const ms = require('ms')
const { ButtonStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: "mute",
    description: "To mute users",
    type: ApplicationCommandType.ChatInput,
    usage: 'mute `user:[user]` `time:[time]`',
    admin: true,
    options: [
        {
            name: 'user',
            type: ApplicationCommandOptionType.User,
            description: "Choose the user !",
            required: true
        },
        {
            name: 'time',
            type: ApplicationCommandOptionType.String,
            description: "Type the time !",
            required: true
        }
    ],
    
    run: async (client, interaction, args, Discord, emoji, color, discordCode) => {
        const owner = await interaction.guild.fetchOwner();
        let langD = await Guild.findById(interaction.guild.id);
        let lang = client.replys.ar;
        if(langD) {
            if(langD.language) {
                lang = client.replys[langD.language]
            }
        }
        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageMessages)) return interaction.followUp({content: `${lang.permErr}`});
        
        const Member = interaction.options.getMember('user');
        const time = interaction.options.getString('time');

        if(Member.user.id == client.user.id) return interaction.followUp({ content: `${lang.mute.me}` });
        
        if(!Member) return interaction.followUp('Member is not found.')
        if(interaction.user.id !== owner.user.id && Member.roles.highest.position >= interaction.member.roles.highest.position) return interaction.followUp(`${lang.mute.cant}`)
            
        await Member.timeout(ms(time), { reason: `By : ${interaction.user.tag}, For : ${ms(time)}` }).then(() => { interaction.followUp(lang.mute.done.replace(/\[user]/g, Member.user)) }).catch((err) => { interaction.followUp(lang.permErr) })
        
    },
};