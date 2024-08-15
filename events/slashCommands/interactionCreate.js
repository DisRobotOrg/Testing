const Discord = require("discord.js");
module.exports = async (client) => {
  
  const discordCode = client.config.discord
  const { Permissions } = require('discord.js');
  const Premium = require("../../schemas/Premium");

  client.on("interactionCreate", async interaction => {
    let color = client.config.color;
    // Slash Command Handling
    if (interaction.isCommand()) {
      //await interaction.deferReply({ ephemeral: false }).catch(() => { });

      async function command() {
        let emoji = client.emoji;

        const cmd = client.slashCommands.get(interaction.commandName) || client.devCommands.get(interaction.commandName);
        if (!cmd)
          return interaction.followUp({ content: '> **This command not found** ..', ephemeral: true });

        const guilds = await Premium.find({ });
        if (cmd.master == true && guilds.filter(e => e.guildId === interaction.guild.id).length == 0) return interaction.followUp('> **This command only for Premium Servers** ..');
        //if (client.user.id !== "824590114419769404" && guilds.filter(e => e.guildId === interaction.guild.id).length == 0) return interaction.followUp({ content: '> **This is a custom premium bot that this server does not own, if you are the owner of the bot you can activate it from the dashboard** ..', ephemeral: true });
        const args = [];

        for (let option of interaction.options.data) {
          if (option.type === "SUB_COMMAND") {
            if (option.name) args.push(option.name);
            option.options ?.forEach((x) => {
              if (x.value) args.push(x.value);
            });
          } else if (option.value) args.push(option.value);
        }
        interaction.member = interaction.guild.members.cache.get(interaction.user.id);

     //  const masters = await Premium.findOne({ guildId: interaction.guild.id });
        /*  if (masters && client.user.id !== masters._id) return interaction.followUp({ content: `> **This server have a Premium subscription, use this premium bot: <@${masters._id}>** ..`, ephemeral: true });
        */
        cmd.run(client, interaction, args, Discord, emoji, color, discordCode);
      }
      

      // ChannelCommands :
      const guildFind = await client.guild.findById(interaction.guild.id)
      if (guildFind) {
        if (guildFind.commands) {
          if (guildFind.commands == "all") return command();
          if (guildFind.commands !== interaction.channel.id && !interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
            await interaction.followUp({ content: `> **You can only use commands in : <#${guildFind.commands}>** ..`, ephemeral: true }).then(() => {
              setTimeout(() => interaction.deleteReply(), 1000);
            })
          } else {
            command()
          }
        } else {
          command()
        }
      } else {
        command()
      }

    }

    // Context Menu Handling
    if (interaction.isUserContextMenuCommand()) {
      ///
//await interaction.reply({ ephemeral: false });
      const command = client.slashCommands.get(interaction.commandName);
      if (command) command.run(client, interaction);
    }
  });

};