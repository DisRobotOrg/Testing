const { glob } = require("glob");
const { promisify } = require("util");
const { Client } = require("discord.js");
const mongoose = require("mongoose");

const globPromise = promisify(glob);
const Premium = require("../schemas/Premium");

/**
 * @param {Client} client
 */
module.exports = async (client) => {

  // Events
  client.on("ready", async () => {
    const bot = await Premium.findById(client.user.id)
    if (client.user.id !== "955838703874473984" && bot && bot.theme == "red") {
      client.config = require("../red/config.json");
      client.emoji = require("../red/emoji.json");
      color = client.config.color;
    }

    if (client.user.id !== "955838703874473984" && bot && bot.theme == "cayan") {
      client.config = require("../cayan/config.json");
      client.emoji = require("../cayan/emoji.json");
      color = client.config.color;
    }

    if (client.user.id !== "955838703874473984" && bot && bot.theme == "yellow") {
      client.config = require("../config.json");
      client.emoji = require("../emoji.json");
      color = client.config.color;
    }
  });

  const eventFiles = await globPromise(`${process.cwd()}/events/*/*.js`);
  await eventFiles.map((value) => require(value)(client));

  // Slash Commands
  const slashCommands = await globPromise(
    `${process.cwd()}/SlashCommands/*/*.js`
  );

  const arrayOfSlashCommands = [];

  client.on("ready", async () => {
    if (client.user.id == "955838703874473984") {
      slashCommands.map((value) => {
        const file = require(value);
        if (!file ?.name) return;
        if (file ?.master == true) return;
        client.slashCommands.set(file.name, file);

        if (["MESSAGE", "USER"].includes(file.type)) delete file.description;
        arrayOfSlashCommands.push(file);
      });
      // Register for all the guilds the bot is in
      await client.application.commands.set(arrayOfSlashCommands);
    } else {
      slashCommands.map((value) => {
        const file = require(value);
        if (!file ?.name) return;
        client.slashCommands.set(file.name, file);

        if (["MESSAGE", "USER"].includes(file.type)) delete file.description;
        arrayOfSlashCommands.push(file);
      });
      // Register for all the guilds the bot is in
      await client.application.commands.set(arrayOfSlashCommands);
    }
    // Help Commands

    const gloabalCommands = await globPromise(
      `${process.cwd()}/SlashCommands/info/*.js`
    );
    await gloabalCommands.map((value) => {
      const file = require(value);
      if (!file ?.name) return;
      client.gloabalCommands.set(file.name, file);
    })

    const adminCommands = await globPromise(
      `${process.cwd()}/SlashCommands/mod/*.js`
    );
    await adminCommands.map((value) => {
      const file = require(value);
      if (!file ?.name) return;
      client.adminCommands.set(file.name, file);
    })

    const premiumCommands = await globPromise(
      `${process.cwd()}/SlashCommands/premium/*.js`
    );
    await premiumCommands.map((value) => {
      const file = require(value);
      if (!file ?.name) return;
      client.premiumCommands.set(file.name, file);
    })
  });

  // Developers Commands
  const devCommands = await globPromise(
    `${process.cwd()}/DevCommands/*/*.js`
  );

  const arrayOfDevCommands = [];

  client.on("ready", async () => {
    if (client.user.id == "955570036616081468") {
      devCommands.map((value) => {
        const file = require(value);
        if (!file ?.name) return;
        if (file ?.master == true) return;
        client.devCommands.set(file.name, file);

        if (["MESSAGE", "USER"].includes(file.type)) delete file.description;
        arrayOfDevCommands.push(file);
      });
      // Register for a single guild
      await client.guilds.cache
        .get("1030758662056181770")
        .commands.set(arrayOfDevCommands);
    }
  });

  // mongoose
  const { mongooseConnectionString } = require('../config.json')
  if (!mongooseConnectionString) return;

  mongoose.connect(mongooseConnectionString).then(() => console.log('Connected to mongodb'));
};
