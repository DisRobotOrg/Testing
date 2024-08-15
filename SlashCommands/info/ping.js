const { Client, CommandInteraction } = require("discord.js");
const { ButtonStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: "ping",
    description: "Ping Command!",
    type: ApplicationCommandType.ChatInput,
    usage: 'ping',
    run: async (client, interaction, args, Discord, emoji, color, discordCode) => {
        interaction.followUp({ content: `**🔔 My Ping is :** \`${client.ws.ping}ms!\`` });
    },
};
