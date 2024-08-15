//require("http").createServer((req, res) => res.end(process.version)).listen()

const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const Discord = require("discord.js");
const colors = require("colors");
const { promisify } = require("util");
const { glob } = require("glob");

const globPromise = promisify(glob)

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    // GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.GuildMessageReactions,
    // GatewayIntentBits.GuildMessageTyping,
    // GatewayIntentBits.DirectMessages,
    // GatewayIntentBits.DirectMessageReactions,
    // GatewayIntentBits.DirectMessageTyping,
    // GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
  ],
  partials: [Partials.Channel],
});



async function login() {
  await client.login(process.env.token);
}

login();

module.exports = client;

// Global Variables
client.commands = new Collection();
client.slashCommands = new Collection();
client.devCommands = new Collection();
client.config = require("./config.json");
const emoji = require("./emoji.json");
client.emoji = require("./emoji.json");
client.replys = require("./replys.json");
client.guild = require("./schemas/Guild");
client.premium = require("./schemas/Premium");

client.gloabalCommands = new Collection();
client.adminCommands = new Collection();
client.premiumCommands = new Collection();

// Enmap Data Base
const Enmap = require("enmap");
client.db = new Enmap();
client.login(process.env.token).then(() => {
  console.log("Loggin ..!")
}).catch(err => { console.log(err) })

// Initializing the project
require("./handler")(client);

client.on("ready", () => {
  client.user.setPresence({ activities: [{ name: `/help - Protect your server !` }], status: "idle" })
  client.user.setStatus('idle');
  require("./dashboard/index.js")(client);
})


process.on("uncaughtException", err => {
  console.log(err)
  return;
})
process.on('warning', (warning) => {
  // console.log(warning.stack);
  return;
})
process.on("unhandledRejection", err => {
  console.log(err)
  return;
})

process.on("rejectionHandled", err => {
  console.log(err)
  return;
});

// ========= تسجيل الدخول الى البوتات
const fs = require("fs");
const path = require("path")

const dirPathPremium = path.join(__dirname, 'premiumBots')

setTimeout(function() {
  fs.readdir(dirPathPremium, (err, files) => {
    files.forEach((PremiumFile) => {
      function bruhBc() {
        let File = require("./premiumBots/" + PremiumFile)
      }
      bruhBc()
    })
  })
}, 5000)

setTimeout(() => {
  if (!client || !client.user) {
    console.log("Client Not Login, Process Kill")
    process.kill(1);
  } else {
    console.log("Client Login")
  }
}, 30000);