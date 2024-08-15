const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db')
const { ButtonStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: "trust",
    description: "To add or remove a user to the control panel",
    usage: 'trust `[add/remove]` `user:[user]`',
    type: ApplicationCommandType.ChatInput,
    admin: true,
    options: [
        {
            name: 'add',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    type: ApplicationCommandOptionType.User,
                    description: "Who is the user?",
                    required: true
                }
            ],
            description: "Adding a user to the control panel ..",
            required: false
        },
        {
            name: 'remove',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    type: ApplicationCommandOptionType.User,
                    description: "Who is the user?",
                    required: true
                }
            ],
            description: "Deleting a user from the control panel ..",
            required: false
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

        if(interaction.user.id !== owner.user.id) return interaction.followUp({ content: `${lang.permErr}`})
        
        if(interaction.options.getSubcommand() === 'add'){
            const user = interaction.options.getMember('user');

            if(!user.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) return interaction.followUp({ content: `${lang.trust.err}`})
            if(user.user.id == owner.user.id) return interaction.followUp({ content: `${lang.trust.errOwner}`})
            if(user.user.bot) return interaction.followUp({ content: `${lang.trust.errBot}`})

            const findGuild = await Guild.findById(interaction.guild.id)
            const trust = await findGuild.trust;
            if(trust.includes(user.user.id)) return interaction.followUp({ content: `${lang.trust.errAlredy}`});

            await Guild.findOneAndUpdate({
                _id: interaction.guild.id,
            },
            { $push: { trust: user.user.id } });
            
            interaction.followUp({ content: `${lang.trust.done}`});
          
        } else if(interaction.options.getSubcommand() === 'remove') {
            const user = interaction.options.getMember('user');

            const findGuild = await Guild.findById(interaction.guild.id)
            const trust = await findGuild.trust;
            if(!trust.includes(user.user.id)) return interaction.followUp({ content: `${lang.trust.errAlredyRemove}`});

            await Guild.findOneAndUpdate({
                _id: interaction.guild.id,
            },
            { $pull: { trust: user.user.id } });
            
            interaction.followUp({ content: `${lang.trust.doneRemove}`});
        }

    },
};