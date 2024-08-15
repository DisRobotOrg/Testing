const { Client, CommandInteraction } = require("discord.js");
const Guild = require('../../schemas/Guild')
const db = require('quick.db')
const { ButtonStyle, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: "setup",
    description: "To set up your server for default settings",
    usage: 'setup',
    type: ApplicationCommandType.ChatInput,
    admin: true,
    
    run: async (client, interaction, args, Discord, emoji, color, discordCode) => {
        const owner = await interaction.guild.fetchOwner();
        let langD = await Guild.findById(interaction.guild.id);
        let lang = client.replys.ar;
        if(langD) {
            if(langD.language) {
                lang = client.replys[langD.language]
            }
        }
      
        if(!interaction.member.permissions.has("ADMINISTRATOR")) return await interaction.followUp({ content: `${lang.permErr}`, ephemeral: true });
        
         await client.guild.findOneAndUpdate({
            _id: interaction.guild.id,
        },
        {
          language: "en",
          owner: owner.user.id,
          commands: "",
          prefix: "",
          line: {
              link: "",
          },
          reaction: {
              channel: "",
              emoji: "",
          },
          slowmode: {
              channel: "",
              time: "",
          },
          premium: {
              token: "",
              user: "",
              time: "",
          },
          autorole: {
              roles: "",
              toggle: "false",
          },
          welcome: {
              channel: "",
              toggle: "false",
          },
          trust: [""],
          protection: {
              antibot: "",
              antihack: "",
              antilink: {
                  roles: "",
                  toggle: "false",
                  action: "",
              },
              antispam: {
                  messages: "",
                  toggle: "false",
                  action: "",
              },
          },
          limit: {
              channels: "",
              bans: "",
              kicks: "",
              roles: "",
          },
          ticket: {
              channel: "",
              catrogy: "",
              embed: {
                  title: "",
                  description: "",
                  button: "",
              },
          },
          logs: {
              message: {
                  channel: "",
                  toggle: "false",
              },
              channel: {
                  channel: "",
                  toggle: "false",
              },
              role: {
                  channel: "",
                  toggle: "false",
              },
              banned: {
                  channel: "",
                  toggle: "false",
              },
              kick: {
                  channel: "",
                  toggle: "false",
              },
              voice: {
                  channel: "",
                  toggle: "false",
              },
              guildMemberAdd: {
                  channel: "",
                  toggle: "false",
              },
              leaves: {
                  channel: "",
                  toggle: "false",
              },
          }
        },
        {
            upsert: true
        }).exec();
        
        interaction.followUp({ content: `${lang.setup}` })
    },
};