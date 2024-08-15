const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db')
const { ButtonStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: "unban_all",
    description: "To unban all users from server",
    type: ApplicationCommandType.ChatInput,
    usage: 'unban_all',
    admin: true,
    master: true,
    run: async (client, interaction, args, Discord, emoji, color, discordCode) => {
        const owner = await interaction.guild.fetchOwner();
        let langD = await Guild.findById(interaction.guild.id);
        let lang = client.replys.ar;
        if(langD) {
            if(langD.language) {
                lang = client.replys[langD.language]
            }
        }
        if(!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) return await interaction.followUp({ content: `${lang.permErr}`, ephemeral: true });
        

        if(interaction.guild.members.me.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
                interaction.guild.bans.fetch()
                  .then(bans => {
                    if (bans.size == 0) return interaction.followUp({ content: lang.unban_all.err });
                    bans.forEach(ban => {
                        interaction.guild.members.unban(ban.user.id);
                    });
                  interaction.followUp({ content: lang.unban_all.done.replace(/\[count]/g, `[** \`${bans.size}\` **]`) })
                }).catch((err) => {
                    interaction.followUp({ content: lang.err.replace(/\[support]/g,`https://discord.gg/${discordCode} - **Code Error** : \`MISSING PERMISSIONS\``), ephemeral: true }) 
                })
        } else {
            interaction.followUp({ content: lang.err.replace(/\[support]/g,`https://discord.gg/${discordCode} - **Code Error** : \`MISSING PERMISSIONS\``), ephemeral: true })
        }
    },
};