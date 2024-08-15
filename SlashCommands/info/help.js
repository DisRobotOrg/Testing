const { Client, Collection, CommandInteraction } = require("discord.js");
const prefix = "/"
const { promisify } = require("util");
const { glob } = require("glob");
const globPromise = promisify(glob);
const Guild = require('../../schemas/Guild')
const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: "help",
  description: "Show commands list",
  usage: 'help `command:[command]`',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'command',
      type: ApplicationCommandOptionType.String,
      description: "Type the command !",
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

    const command = interaction.options.getString('command');

    if (!command) {
      
    const Gloabal = client.gloabalCommands.map(
      (cmd) =>
        `\`${prefix}${cmd.name}\``
    ).sort();

    const Admin = client.adminCommands.map(
      (cmd) =>
        `\`${prefix}${cmd.name}\``
    ).sort();

    const Premium = client.premiumCommands.map(
      (cmd) =>
        `\`${prefix}${cmd.name}\``
    ).sort();
      
      
        const exampleEmbed = new Discord.EmbedBuilder()
          .setColor(color)
          .setTitle(`${emoji.logo} - ${client.user.username} ${lang.help.title} :`)
          .setDescription(`
            ** ${emoji.point} \`-\` ${lang.help.prefix} : ( \`${prefix}\` )**
            ** ${emoji.point} \`-\` ${lang.help.commands} : ( \`${Gloabal.length + Admin.length + Premium.length}\` )**
        
            **${emoji.hash} - __${lang.help.gloabal}__ : **

            > ${Gloabal.join(" , ")} .
                    
            **${emoji.hash} - __${lang.help.admin}__ : **

            > ${Admin.join(" , ")} .
                    
            **${emoji.hash} - __${lang.help.premium}__ : **

            > ${Premium.join(" , ")} .
                    
        `)
          .setThumbnail(emoji.thu)
          .setImage(emoji.help);
          if(client.user.id === "824590114419769404") {
            exampleEmbed.addFields(
              { name: `${emoji.hash} - ${lang.help.fields.servers}`, value: `**    [ \`${client.guilds.cache.size + 1}\` ]**`, inline: true },
              { name: `${emoji.hash} - ${lang.help.fields.channels}`, value: `**    [ \`${client.channels.cache.size}\` ]**`, inline: true },
              { name: `${emoji.hash} - ${lang.help.fields.users}`, value: `**    [ \`${client.users.cache.size}\` ]**`, inline: true },
            )
          }
          

        const row = new Discord.ActionRowBuilder()
          .addComponents(new Discord.ButtonBuilder()
            .setLabel(lang.help.buttons.invite)
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/api/oauth2/authorize?client_id=824590114419769404&permissions=${emoji.perm}&scope=bot%20applications.commands`)
            .setEmoji(emoji.linkID)
          )
          .addComponents(new Discord.ButtonBuilder()
            .setLabel(lang.help.buttons.support)
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.gg/${discordCode}`)
            .setEmoji(emoji.linkID)
          )
          .addComponents(new Discord.ButtonBuilder()
            .setLabel(lang.help.buttons.website)
            .setStyle(ButtonStyle.Link)
            .setURL(`${emoji.dashboard}`)
            .setEmoji(emoji.linkID)
          );

        await interaction.followUp({ embeds: [exampleEmbed], components: [row] });
      } else if (command) {
        let Command = client.slashCommands.get(command);
        if (!Command) return interaction.followUp({ content: `> ${emoji.point} \`-\` **The command not found !..**` });

        const exampleEmbed = new Discord.EmbedBuilder()
          .setColor(color)
          .setTitle(`${emoji.logo} - Command : ${command}`)
          .setDescription(`
                    ** ${emoji.point} \`-\` Description :**
                    > ${Command.description}

                    ** ${emoji.point} \`-\` Usage :**
                    > /${Command.usage}
                `)
          .setThumbnail(emoji.thu)

        interaction.followUp({ embeds: [exampleEmbed] });
      }

  },
};
