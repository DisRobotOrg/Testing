const Discord = require("discord.js");
module.exports = async (client) => {
  const { PermissionsBitField } = require('discord.js');
  const Autoline = require("../../schemas/Autoline");
  
  client.on("messageCreate", async message => {
    const Premium = require("../../schemas/Premium");
    const masters = await Premium.findOne({ guildId: message.guild.id });
      if (masters && client.user.id !== masters._id) return;
    
    if (!message.guild) return;
    const findGuild = await client.guild.findById(message.guild.id)
    if (findGuild) {
      prefix = findGuild.prefix
      if (!findGuild.prefix) prefix = "!"
    }
  
    let langD = await client.guild.findById(message.guild.id);
    let lang = client.replys.ar;
    if (langD) {
      if (langD.language) {
        lang = client.replys[langD.language]
      }
    }
  
    // Level's system
  
    /*const key = `level-${message.author.id}`;
    const getDB = client.db.get(key)
  
    if(!getDB) {
      client.db.ensure(key, {
        user: message.author.id,
        guild: message.guild.id,
        points: 0,
        level: 1
      });
    }
  
    var msgl = message.content.length / (Math.floor(Math.random() * (message.content.length - message.content.length / 100 + 1) + 10));
    //if too short the message
    if (msgl < 10) {
      //get a random num between 0 and 2 rounded
      var randomnum = Math.floor((Math.random() * 2) * 100) / 100
      //basically databasing again
      client.db.math(key, `+`, randomnum, `points`)
      client.db.inc(key, `points`);
    }
    //if not too short do this
    else {
      //get a random num between rounded but it belongs to message length
      var randomnum = 1 + Math.floor(msgl * 100) / 100
  
      client.db.math(key, `+`, randomnum, `points`)
      client.db.inc(key, `points`);
    }
  
    const curLevel = Math.floor(0.1 * Math.sqrt(client.db.get(key, `points`)));
  
    if (client.db.get(key, `level`) < curLevel) {
      client.db.set(key, curLevel, `level`);
    }*/
  
    // AutoLine :
    const guildFinder = await client.guild.findById(message.guild.id)
    if(guildFinder) {
      if(message.author.bot) return;
      if(message.author.id === client.user.id) return;
      if(guildFinder.line) {
        if(guildFinder.line.link) {
          const channelFinder = await Autoline.findOne({ guildId: message.guild.id })
          if(channelFinder) {
            if(channelFinder.channelId) {
              if(channelFinder.channelId.includes(message.channel.id)) {
                message.channel.send({ files:[guildFinder.line.link] }).catch(() => {})
              }
            }
          }
        }
      }
    }
  
    // AntiLinks :
    if (message.content.includes('http://') || message.content.includes("https://")) {
      if (await client.guild.findById(message.guild.id)) {
        const guild = await client.guild.findById(message.guild.id)
        if (guild.protection.antilink) {
          if (await guild.protection.antilink.toggle === "true") {
            let role = message.guild.roles.cache.get(await guild.protection.antilink.roles);
            if (role) {
              if (message.member.roles.cache.has(role.id)) {
                return;
              } else if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return;
              } else {
                const getPoints = client.db.get(`antilinks_${message.guild.id}_${message.author.id}`)
                if (!getPoints) {
                  client.db.set(`antilinks_${message.guild.id}_${message.author.id}`, 0)
                  if (client.db.get(`antilinks_${message.guild.id}_${message.author.id}`) >= 5) {

                    await message.author.timeout(ms("10m"), { reason: `By : ${interaction.user.tag}, For : 10m` }).then(() => { message.channel.send(lang.antiLinkMute.replace(/\[user]/g, message.author)) }).catch((err) => { })
                    message.delete().then(() => {
                      client.db.math(`antilinks_${message.guild.id}_${message.author.id}`, "add", 1)
                      message.author.send(`${lang.antiLinkDelete}`)
                      setTimeout(() => {
                        client.db.delete(`antilinks_${message.guild.id}_${message.author.id}`)
                      }, 5000)
                    })
                  }
                  message.delete().then(() => {
                    client.db.math(`antilinks_${message.guild.id}_${message.author.id}`, "add", 1)
                    message.author.send(`${lang.antiLinkDelete}`)
                    setTimeout(() => {
                      client.db.delete(`antilinks_${message.guild.id}_${message.author.id}`)
                    }, 5000)
                  })
                }
                if (client.db.get(`antilinks_${message.guild.id}_${message.author.id}`) >= 5) {
                  await message.author.timeout(ms("10m"), { reason: `By : ${interaction.user.tag}, For : 10m` }).then(() => { message.channel.send(lang.antiLinkMute.replace(/\[user]/g, message.author)) }).catch((err) => { })
                  message.delete().then(() => {
                    client.db.math(`antilinks_${message.guild.id}_${message.author.id}`, "add", 1)
                    message.author.send(`${lang.antiLinkDelete}`)
                    setTimeout(() => {
                      client.db.delete(`antilinks_${message.guild.id}_${message.author.id}`)
                    }, 5000)
                  })
                }
                message.delete().then(() => {
                  client.db.math(`antilinks_${message.guild.id}_${message.author.id}`, "add", 1)
                  message.author.send(`${lang.antiLinkDelete}`)
                  setTimeout(() => {
                    client.db.delete(`antilinks_${message.guild.id}_${message.author.id}`)
                  }, 5000)
                })
              }
            } else if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
              return;
            } else {
              const getPoints = client.db.get(`antilinks_${message.guild.id}_${message.author.id}`)
              if (!getPoints) {
                client.db.set(`antilinks_${message.guild.id}_${message.author.id}`, 0)
                if (client.db.get(`antilinks_${message.guild.id}_${message.author.id}`) >= 5) {
                  await message.author.timeout(ms("10m"), { reason: `By : ${interaction.user.tag}, For : 10m` }).then(() => { message.channel.send(lang.antiLinkMute.replace(/\[user]/g, message.author)) }).catch((err) => { })
                  message.delete().then(() => {
                    client.db.math(`antilinks_${message.guild.id}_${message.author.id}`, "add", 1)
                    message.author.send(`${lang.antiLinkDelete}`)
                    setTimeout(() => {
                      client.db.delete(`antilinks_${message.guild.id}_${message.author.id}`)
                    }, 5000)
                  })
                }
                message.delete().then(() => {
                  client.db.math(`antilinks_${message.guild.id}_${message.author.id}`, "add", 1)
                  message.author.send(`${lang.antiLinkDelete}`)
                  setTimeout(() => {
                    client.db.delete(`antilinks_${message.guild.id}_${message.author.id}`)
                  }, 5000)
                })
              }
              if (client.db.get(`antilinks_${message.guild.id}_${message.author.id}`) >= 5) {
                await message.author.timeout(ms("10m"), { reason: `By : ${interaction.user.tag}, For : 10m` }).then(() => { message.channel.send(lang.antiLinkMute.replace(/\[user]/g, message.author)) }).catch((err) => { })
                message.delete().then(() => {
                  client.db.math(`antilinks_${message.guild.id}_${message.author.id}`, "add", 1)
                  message.author.send(`${lang.antiLinkDelete}`)
                  setTimeout(() => {
                    client.db.delete(`antilinks_${message.guild.id}_${message.author.id}`)
                  }, 5000)
                })
              }
              message.delete().then(() => {
                client.db.math(`antilinks_${message.guild.id}_${message.author.id}`, "add", 1)
                message.author.send(`${lang.antiLinkDelete}`)
                setTimeout(() => {
                  client.db.delete(`antilinks_${message.guild.id}_${message.author.id}`)
                }, 5000)
              })
            }
          }
        }
      }
    }
  
    // Anti Spam :
    if (await client.guild.findById(message.guild.id)) {
      const guild = await client.guild.findById(message.guild.id)
      if (guild.protection.antispam) {
        if (await guild.protection.antispam.toggle === "true") {
          let messages = await guild.protection.antispam.messages || 5;
          if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return;
          } else {
            const getPoints = client.db.get(`antispam_${message.guild.id}_${message.author.id}`)
            if (!getPoints) {
              client.db.set(`antispam_${message.guild.id}_${message.author.id}`, 0)
              
              client.db.math(`antispam_${message.guild.id}_${message.author.id}`, "add", 1)
              setTimeout(() => {
                client.db.delete(`antispam_${message.guild.id}_${message.author.id}`)
              }, 5000)
            }
            if (client.db.get(`antispam_${message.guild.id}_${message.author.id}`) >= messages) {
              // ======== العقوبات
  
              if(guild.protection.antispam.action) {
                if(guild.protection.antispam.action == "none" || !guild.protection.antispam.action) return;
                if(guild.protection.antispam.action == "mute") {
                  await message.author.timeout(ms("10m"), { reason: `By : ${interaction.user.tag}, For : 10m` }).then(() => { message.channel.send(lang.antiSpamMute.replace(/\[user]/g, message.author)) }).catch((err) => { })
                  client.db.math(`antispam_${message.guild.id}_${message.author.id}`, "add", 1)
                  setTimeout(() => {
                    client.db.delete(`aantispam_${message.guild.id}_${message.author.id}`)
                  }, 5000)
                }
                if(guild.protection.antispam.action == "warn") {
                  const warn = new Discord.EmbedBuilder()
                    .setColor(client.config.color)
                    .setTitle("📚 Warn!")
                    .setFooter({ text: `Server: ${message.guild.name}`, iconURL: message.author.displayAvatarURL({ dynamic: true, size: 1024 }) })
                    .setDescription(`Stop Spam in <#${message.channel.id}>!`)
                    .setTimestamp()
                    .setThumbnail(message.guild.iconURL({ dynamic: true, size: 1024 }));
  
                  message.author.send({ embeds:[warn] })
                  setTimeout(() => {
                    client.db.delete(`aantispam_${message.guild.id}_${message.author.id}`)
                  }, 5000)
                }
              }
            }
            client.db.math(`antispam_${message.guild.id}_${message.author.id}`, "add", 1)
            setTimeout(() => {
              client.db.delete(`antispam_${message.guild.id}_${message.author.id}`)
            }, 5000)
          }
        }
      }
    }
  });
};