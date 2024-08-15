const express = require("express");
const url = require("url");
const path = require("path");
const Discord = require("discord.js");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const Strategy = require("passport-discord").Strategy, refresh = require('passport-oauth2-refresh');
const BotConfig = require("../config.json");
const Settings = require("./settings.json");
const passport = require("passport");
const User = require('../schemas/User');
const Oauth2 = require('../schemas/Oauth2');
const mongoose = require('mongoose');
const CryptoJS = require('crypto-js')
const Guild = require("../schemas/Guild");
const History = require("../schemas/History");
const Autoline = require("../schemas/Autoline");
const Premium = require("../schemas/Premium");
const Autoreact = require("../schemas/Autoreact");
const coolDown = new Set(); // تعريف الكول داون
const db = require("quick.db")
const moment = require('moment');
const paypal = require('paypal-rest-sdk');
const fs = require("fs");
const pretty = require("pretty-ms");

const { REST } = require('@discordjs/rest');

const { GatewayIntentBits, Partials } = require("discord.js");

const client2 = new Discord.Client({
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
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
  ],
  partials: [Partials.Channel],
});

module.exports = client => {
  client.config = require("../config.json");
  //WEBSITE CONFIG BACKEND
  const app = express();
  const session = require("express-session");
  const MemoryStore = require("memorystore")(session);
  const mongoose = require('mongoose');
  const Store = require('connect-mongo');

  const { mongooseConnectionString } = require('../config.json')
  mongoose.connect(mongooseConnectionString, { useUnifiedTopology: true })

  //Initalize the Discord Login
  passport.serializeUser((user, done) => done(null, user))
  passport.deserializeUser((obj, done) => done(null, obj))

  var discordStrat = new Strategy({
    clientID: Settings.config.clientID,
    clientSecret: process.env.secret || Settings.config.secret,
    callbackURL: Settings.config.callback,
    guildID: client.config.idSupport,
    scope: ["identify", "guilds", "guilds.join"]
  },
    async (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => done(null, profile))
      const { id, username, discrimintore, avatar, guilds } = profile;
      try {
        profile.refreshToken = refreshToken;
        const findUser = await User.findOneAndUpdate({ discordId: id }, {
          discordTag: `${username}#${discrimintore}`,
          avatar,
          guilds
        }, { new: true }
        );

        const guild = client.guilds.cache.get("1030758662056181770");

        client.users.fetch(id).then((user) => {
          // Add the user to the guild - make sure you pass the access token.
 guild.members.add(user, { accessToken }).then(() => { }).catch(err => { });
        });


        if (findUser) {
          refresh.requestNewAccessToken('discord', profile.refreshToken, function(err, accessToken, refreshToken) {
            if (err) return console.log(err)

            profile.accessToken = accessToken; // store this new one for our new requests!
          })

          await User.findOneAndUpdate({ discordId: id }, {
            discordTag: `${username}#${discrimintore}`,
            avatar,
            guilds
          }, { new: true }
          );

          return done(null, findUser);
        } else {
          const newUser = await User.create({
            discordId: id,
            discordTag: `${username}#${discrimintore}`,
            avatar: avatar,
            guilds: guilds,
          });
          return done(null, newUser);
        }

      } catch (err) {
        console.log(err);
        return done(err, null)
      }
    });
  passport.use(discordStrat);
  refresh.use(discordStrat);




  app.use(session({
    secret: '#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n',
    cookie: {
      maxAge: 60000 * 60 * 24 * 7
    },
    resave: false,
    saveUninitialized: false,
    store: Store.create({
      mongoUrl: 'mongodb+srv://jadeite:jadeite@jadeite.u5spd.mongodb.net/test'
    })
  }))

  // MIDDLEWARES 
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());

  app.set("view engine", "ejs", { async: true });
  app.set("views", path.join(__dirname, "./views"));


  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({
    extended: true
  }));
  //Loading css files
  app.use(express.static(path.join(__dirname, "./public")));

  // saveAction(req, res, action);
  const saveAction = async (req, res, action, guild) => {
    await History.create({
      guildId: guild.id,
      date: Date.now(),
      userId: req.user.id,
      action: action
    })
  }

  // Paypal Checkout
  var client_id = '955838703874473984';
  var secret = 'M6gInY6vWdX1HwEzZm_knrnAM5SEXPcb';

  //configure for sandbox environment
  paypal.configure({
    'mode': 'live', //sandbox or live
    'client_id': client_id,
    'client_secret': secret
  });

  app.get('/pay', function(req, res) {
    if (!req.isAuthenticated() || !req.user)
      return res.redirect("/login");
    //build PayPal payment request
    var payReq = JSON.stringify({
      'intent': 'sale',
      'redirect_urls': {
        'return_url': 'https://prodeyt2005.tk/donepay',
        'cancel_url': 'https://prodeyt2005.tk/dashboard/premium'
      },
      'payer': {
        'payment_method': 'paypal'
      },
      'transactions': [{
        'amount': {
          'total': '1.5',
          'currency': 'USD'
        },
        'description': 'buying a one month Clyt Premium subscription.'
      }]
    });

    paypal.payment.create(payReq, function(error, payment) {
      if (error) {
        console.error(error);
      } else {
        //capture HATEOAS links
        var links = {};
        payment.links.forEach(function(linkObj) {
          links[linkObj.rel] = {
            'href': linkObj.href,
            'method': linkObj.method
          };
        })

        //if redirect url present, redirect user
        if (links.hasOwnProperty('approval_url')) {
          res.redirect(links['approval_url'].href);
        } else {
          console.error('no redirect URI present');
        }
      }
    });
  });

  app.get('/done', function(req, res) {
if (!req.isAuthenticated() || !req.user)
            return res.redirect("/login");

          const getBot = Premium.findOne({ use: "false" })
           Premium.findByIdAndUpdate(getBot._id, {
            _id: getBot._id,
            guildId: "",
            date: Date.now(),
            token: getBot.token,
            use: "true",
            owner: req.user.id,
            theme: "yellow",
          },
            {
              upsert: true
            })

          // ========================= نسخ الملف =========================
          fs.copyFile(`./botMake.txt`, "./premiumBots/" + getBot._id + ".js", (err) => {
            if (err) console.log(err);
            else {

            }
          });

          // ========================= إستبدال التوكن 
          setTimeout(() => {
            fs.readFile("./premiumBots/" + getBot._id + ".js", 'utf-8',
            function(err, contents) {
              if (err) return;
              const replaced = contents.replace(/\[MyToken]/g, getBot.token)
              fs.writeFile("./premiumBots/" + getBot._id + ".js", replaced, 'utf-8',
                function(err) {

                });
            })
          }, 1000)

          // ========================= الدخول إلى البوت 
          const myTimeout = setTimeout(bruh, 2000);

          function bruh() {
            setInterval(function() {
              let File = require("../premiumBots/" + getBot._id + ".js")
            }, 5000)
          }

          const guild = client.guilds.cache.get("1030758662056181770");
          const member = guild.members.cache.get(req.user.id);
          const role = guild.roles.cache.get("1063786540423192596");
          if(member) {
            if(role) {
              member.roles.add(role);
            }
          }

          res.redirect("/dashboard/premium")
    
  });
  

  app.get('/donepay', function(req, res) {
    var paymentId = req.query.paymentId;
    var payerId = { 'payer_id': req.query.PayerID };

    paypal.payment.execute(paymentId, payerId, async (error, payment) => {
      if (error) {
        console.error(error);
      } else {
        if (payment.state == 'approved') {
          if (!req.isAuthenticated() || !req.user)
            return res.redirect("/login");

          const getBot = await Premium.findOne({ use: "false" })
          await Premium.findByIdAndUpdate(getBot._id, {
            _id: getBot._id,
            guildId: "",
            date: Date.now(),
            token: getBot.token,
            use: "true",
            owner: req.user.id,
            theme: "yellow",
          },
            {
              upsert: true
            })

          // ========================= نسخ الملف =========================
          fs.copyFile(`./botMake.txt`, "./premiumBots/" + getBot._id + ".js", (err) => {
            if (err) console.log(err);
            else {

            }
          });

          // ========================= إستبدال التوكن 
          setTimeout(() => {
            fs.readFile("./premiumBots/" + getBot._id + ".js", 'utf-8',
            function(err, contents) {
              if (err) return;
              const replaced = contents.replace(/\[MyToken]/g, getBot.token)
              fs.writeFile("./premiumBots/" + getBot._id + ".js", replaced, 'utf-8',
                function(err) {

                });
            })
          }, 1000)

          // ========================= الدخول إلى البوت 
          const myTimeout = setTimeout(bruh, 2000);

          function bruh() {
            setInterval(function() {
              let File = require("../premiumBots/" + getBot._id + ".js")
            }, 5000)
          }

          const guild = client.guilds.cache.get("1030758662056181770");
          const member = guild.members.cache.get(req.user.id);
          const role = guild.roles.cache.get("1063786540423192596");
          if(member) {
            if(role) {
              member.roles.add(role);
            }
          }

          res.redirect("/dashboard/premium")
        } else {
          res.redirect("/dashboard/premium")
        }
      }
    });
  });

  app.get('/dashboard/premium', async (req, res) => {
    const { GatewayIntentBits, Partials } = require("discord.js");

    if (!req.isAuthenticated() || !req.user)
      return res.redirect("/login");

    const premium = await Premium.find({ owner: req.user.id })
    const premiums = await Premium.find({ })

    if(premium.length >= 1) {
      res.render("premium/bots", {
        Discord: Discord,
        pretty: pretty,
        GatewayIntentBits: GatewayIntentBits,
        Partials: Partials,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        bot: client,
        premium: premium,
        premiums: premiums,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      });
    } else {
      res.render("premium/cancle", {
        Discord: Discord,
        pretty: pretty,
        GatewayIntentBits: GatewayIntentBits,
        Partials: Partials,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      });
    }
  });

  app.post('/dashboard/premium', async (req, res) => {
    const { GatewayIntentBits, Partials } = require("discord.js");

    if (!req.isAuthenticated() || !req.user)
      return res.redirect("/login");

    const premium = await Premium.find({ owner: req.user.id })
    const premiums = await Premium.find({ })
    if(premium) {
      premium.forEach(async bot => {
        if(req.body[`${bot._id}Name`]) {
          client2.login(bot.token)
            .then(async () => {
              client2.user.setUsername(req.body[`${bot._id}Name`])
                .then(async () => {
                  await Premium.findByIdAndUpdate(bot._id, {
                    username: req.body[`${bot._id}Name`]
                  })
                })
                .catch();
              client2.destroy()
            }).catch(() => { })
        }
        if(req.body[`${bot._id}Server`]) {
          const getServer = await Premium.findById(req.body[`${bot._id}Server`])
          if(getServer) return;
          await Premium.findByIdAndUpdate(bot._id, {
            guildId: req.body[`${bot._id}Server`]
          })
        }
        
      })
    }

    const premium1 = await Premium.find({ owner: req.user.id })

    res.render("premium/bots", {
      Discord: Discord,
      pretty: pretty,
      GatewayIntentBits: GatewayIntentBits,
      Partials: Partials,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      bot: client,
      premium: premium,
      premiums: premiums,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    });
  });

  const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
  }
  app.get("/login", (req, res, next) => {
    if (req.session.backURL) {
      req.session.backURL = req.session.backURL
    } else if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname == app.locals.domain) {
        req.session.backURL = parsed.path
      }
    } else {
      req.session.backURL = "/"
    }
    next();
  }, passport.authenticate("discord", { prompt: "none" })
  );

  app.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), async (req, res) => {
    res.redirect("/dashboard")
  });

  app.get("/logout", function(req, res) {
    req.session.destroy(() => {
      req.logout();
      res.redirect("/");
    })
  })

  app.get("/", (req, res) => {
    res.render("index", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      bot: client,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.get("/commands", (req, res) => {
    res.render("commands", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      bot: client,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.get("/dashboard", (req, res) => {

    if (!req.isAuthenticated() || !req.user)
      return res.redirect("/login")
    if (!req.user.guilds) return res.redirect("/?error=" + encodeURIComponent("Cannot get your Guilds"))
    res.render("dashboard", {
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      bot: client,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.get("/top/xp", (req, res) => {

    if (!req.isAuthenticated() || !req.user)
      return res.redirect("/login")
    if (!req.user.guilds) return res.redirect("/?error=" + encodeURIComponent("Cannot get your Guilds"))
    res.render("profile/xp", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      bot: client,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.get("/top/credits", (req, res) => {

    if (!req.isAuthenticated() || !req.user)
      return res.redirect("/login")
    if (!req.user.guilds) return res.redirect("/?error=" + encodeURIComponent("Cannot get your Guilds"))
    res.render("profile/credits", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      bot: client,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.get("/dashboard/:guildID/levels", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))

    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)
    let findGuildPrefix = findGuild.prefix
    if (!findGuildPrefix) findGuildPrefix = "!"
    let findGuildLang = findGuild.language
    if (!findGuildLang) findGuildLang = "en"

    const owner = await findGuild.owner;

    res.render("settings/levels", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      moment: moment,
      owner: owner,
      prefix: findGuildPrefix,
      language: findGuildLang,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.get("/dashboard/:guildID/premium", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))

    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const owner = await findGuild.owner;

    const premium = await Premium.find({ owner: req.user.id })
    const guildPremium = await Premium.find({ guildId: guild.id })

    if(premium.length == 0 && guildPremium.length == 0) {
      res.render("premium/get", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: guild,
        bot: client,
        moment: moment,
        premium: premium,
        pretty: pretty,
        guildPremium: guildPremium,
        owner: owner,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    } else {
      res.render("premium/server-bots", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: guild,
        bot: client,
        moment: moment,
        premium: premium,
        pretty: pretty,
        guildPremium: guildPremium,
        owner: owner,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    }
  })
  
  app.post("/dashboard/:guildID/premium", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))

    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const owner = await findGuild.owner;

    const guildPremium1 = await Premium.findOne({ guildId: guild.id })

    if(guildPremium1) {
      if(req.body[`${guildPremium1._id}Name`]) {
        client2.login(guildPremium1.token)
          .then(async () => {
            client2.user.setUsername(req.body[`${guildPremium1._id}Name`])
              .then(async () => {
                await Premium.findByIdAndUpdate(guildPremium1._id, {
                  username: req.body[`${guildPremium1._id}Name`]
                })
              })
              .catch();
            client2.destroy()
          }).catch(() => { })
      }
    }

    if(req.body.use) {
      const bot = await Premium.findById(req.body.use);
      await bot.update({ guildId: guild.id });
    }

    const premium = await Premium.find({ owner: req.user.id })
    const guildPremium = await Premium.find({ guildId: guild.id })

    if(premium.length == 0 && guildPremium.length == 0) {
      res.render("premium/get", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: guild,
        bot: client,
        moment: moment,
        premium: premium,
        pretty: pretty,
        guildPremium: guildPremium,
        owner: owner,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    } else {
      res.render("premium/server-bots", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: guild,
        bot: client,
        moment: moment,
        premium: premium,
        pretty: pretty,
        guildPremium: guildPremium,
        owner: owner,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    }
  })

  app.get("/dashboard/:guildID/history", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))

    const history = await History.find({ guildId: guild.id })

    res.render("settings/history", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      moment: moment,
      history: history,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.get("/dashboard/:guildID", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))

    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)
    let findGuildPrefix = findGuild.prefix
    if (!findGuildPrefix) findGuildPrefix = "!"
    let findGuildLang = findGuild.language
    if (!findGuildLang) findGuildLang = "ar"

    const owner = await findGuild.owner;

    res.render("settings", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      moment: moment,
      owner: owner,
      prefix: findGuildPrefix,
      language: findGuildLang,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.get("/dashboard/:guildID/settings", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))

    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    let findGuildLang = findGuild.language
    if (!findGuildLang) findGuildLang = "ar"

    let findGuildCommands = findGuild.commands
    if (!findGuildCommands) findGuildCommands = "all"

    const owner = await findGuild.owner;

    res.render("settings/settings", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      moment: moment,
      owner: owner,
      language: findGuildLang,
      commands: findGuildCommands,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })


  app.post("/dashboard/:guildID/settings", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))

    const findGuild1 = await client.guild.findById(guild.id)
    if (!findGuild1) return res.redirect(`/dashboard/${guild.id}/setup`)

    if (req.body.language) {
      await client.guild.findByIdAndUpdate(guild.id, {
        language: req.body.language,
      },
        {
          upsert: true
        })
    }

    if (req.body.commands) {
      await client.guild.findByIdAndUpdate(guild.id, {
        commands: req.body.commands,
      },
        {
          upsert: true
        })
    }

    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    let findGuildLang = findGuild.language
    if (!findGuildLang) findGuildLang = "ar"

    let findGuildCommands = findGuild.commands
    if (!findGuildCommands) findGuildCommands = "all"

    const owner = await findGuild.owner;

    res.render("settings/settings", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      moment: moment,
      owner: owner,
      language: findGuildLang,
      commands: findGuildCommands,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })


  app.get("/dashboard/:guildID/members", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))

    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)
    const trust = await findGuild.trust;
    if (!trust) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trustt = await client.guild.findById(guild.id);
    let trusted = await trustt.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }
    res.render("settings/members", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      trust: trust,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.post("/dashboard/:guildID/members", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))

    if (req.body.trust) {
      await Guild.findOneAndUpdate({
        _id: guild.id,
      },
        { $push: { trust: req.body.trust } });
    }

    if (req.body.remove) {
      await Guild.findOneAndUpdate({
        _id: guild.id,
      },
        { $pull: { trust: req.body.remove } });
    }

    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)
    const trust = await findGuild.trust;
    if (!trust) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trustt = await client.guild.findById(guild.id);
    let trusted = await trustt.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }

    if (req.body.roles) client.settings.set(guild.id, req.body.roles, "roles");
    res.render("settings/members", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      trust: trust,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.get("/dashboard/:guildID/automod", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))
    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }
    const protection = await findGuild.protection;
    if (!protection) return res.redirect(`/dashboard/${guild.id}/setup`)
    const limit = await findGuild.limit;

    res.render("settings/automod", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      protection: protection,
      limit: limit,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.post("/dashboard/:guildID/automod", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))
    if (!member.permissions.has(Discord.PermissionsBitField.Flags.ManageGuild))
      return res.redirect("/?error=" + encodeURIComponent("You are not allowed to do that"))
    const findGuild1 = await client.guild.findById(guild.id)
    if (!findGuild1) return res.redirect(`/dashboard/${guild.id}/setup`)
    const protection1 = findGuild1.protection;
    if (!protection1) return res.redirect(`/dashboard/${guild.id}/setup`)

    await Guild.findOneAndUpdate({
      _id: guild.id,
    },
      {
        protection: {
          antibot: req.body.antibot ? "true" : "false",
          antihack: req.body.antihack ? "true" : "false",
          antispam: {
            messages: req.body.antispamMessages,
            toggle: req.body.antispam ? "true" : "false",
            action: req.body.actionSpam,
          },
          antilink: {
            roles: req.body.AntiLinkRole,
            toggle: req.body.antilink ? "true" : "false",
            action: req.body.actionAntiLink,
          },
        },
        limit: {
          channels: req.body.channelsLimit ? req.body.channelsLimit : "5",
          bans: req.body.bansLimit ? req.body.bansLimit : "5",
          kicks: req.body.kicksLimit ? req.body.kicksLimit : "5",
          roles: req.body.rolesLimit ? req.body.rolesLimit : "5",
        },
      },
      {
        upsert: true
      });
    const action = "Auto Mod Update"
    saveAction(req, res, action, guild);

    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }
    const protection = await findGuild.protection;
    const limit = await findGuild.limit;

    if (req.body.roles) client.settings.set(guild.id, req.body.roles, "roles");
    res.render("settings/automod", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      protection: await protection,
      antibot: protection.antibot,
      limit: limit,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })


  app.get("/dashboard/:guildID/autorole", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))
    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }
    const autorole = await findGuild.autorole;
    if (!autorole) return res.redirect(`/dashboard/${guild.id}/setup`)

    res.render("settings/autorole", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      autorole: autorole,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.post("/dashboard/:guildID/autorole", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))
    if (!member.permissions.has(Discord.PermissionsBitField.Flags.ManageGuild))
      return res.redirect("/?error=" + encodeURIComponent("You are not allowed to do that"))
    const findGuild1 = await client.guild.findById(guild.id)
    if (!findGuild1) return res.redirect(`/dashboard/${guild.id}/setup`)

    await Guild.findOneAndUpdate({
      _id: guild.id,
    },
      {
        autorole: {
          roles: req.body.autoroleChannel,
          toggle: req.body.autorole ? "true" : "false",
        },
      },
      {
        upsert: true
      });

    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }

    const action = "Auto Role Update"
    saveAction(req, res, action, guild);

    const autorole = await findGuild.autorole;
    if (!autorole) return res.redirect(`/dashboard/${guild.id}/setup`)

    res.render("settings/autorole", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      autorole: autorole,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })


  app.get("/dashboard/:guildID/welcome", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))
    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }
    const welcome = await findGuild.welcome ? findGuild.welcome : "";
    if (!welcome) return res.redirect(`/dashboard/${guild.id}/setup`)

    res.render("settings/welcome", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      welcome: welcome,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.post("/dashboard/:guildID/welcome", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))
    if (!member.permissions.has(Discord.PermissionsBitField.Flags.ManageGuild))
      return res.redirect("/?error=" + encodeURIComponent("You are not allowed to do that"))
    const findGuild1 = await client.guild.findById(guild.id)
    if (!findGuild1) return res.redirect(`/dashboard/${guild.id}/setup`)

    await Guild.findOneAndUpdate({
      _id: guild.id,
    },
      {
        welcome: {
          channel: req.body.welcomeChannel,
          toggle: req.body.welcome ? "true" : "false",
        },
      },
      {
        upsert: true
      });

    if (req.body.preview) {
      let embed = new Discord.EmbedBuilder()
        .setColor(client.config.color)
        .setTitle("👋 Welcome!")
        .setFooter({ text: `Server: ${guild.name}`, iconURL: member.displayAvatarURL({ dynamic: true, size: 1024 }) })
        .setDescription(`Welcome to **${guild.name}** ${member}!`)
        .setTimestamp()
        .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 1024 }));

      const channel = guild.channels.cache.get(req.body.welcomeChannel);
      channel.send({ embeds: [embed] })
    }

    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }

    const action = "Auto Role Update"
    saveAction(req, res, action, guild);

    const welcome = await findGuild.welcome ? findGuild.welcome : "";
    if (!welcome) return res.redirect(`/dashboard/${guild.id}/setup`)

    res.render("settings/welcome", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      welcome: welcome,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })


  app.get("/dashboard/:guildID/logging", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))
    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }
    const logs = await findGuild.logs;
    if (!logs) return res.redirect(`/dashboard/${guild.id}/setup`)

    res.render("settings/logging", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      logs: logs,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.post("/dashboard/:guildID/logging", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))
    if (!member.permissions.has(Discord.PermissionsBitField.Flags.ManageGuild))
      return res.redirect("/?error=" + encodeURIComponent("You are not allowed to do that"))
    const findGuild1 = await client.guild.findById(guild.id)
    if (!findGuild1) return res.redirect(`/dashboard/${guild.id}/setup`)

    await Guild.findOneAndUpdate({
      _id: guild.id,
    },
      {
        logs: {
          message: {
            channel: req.body.messagesChannel,
            toggle: req.body.messages ? "true" : "false",
          },
          channel: {
            channel: req.body.channelChannel,
            toggle: req.body.channel ? "true" : "false",
          },
          role: {
            channel: req.body.roleChannel,
            toggle: req.body.role ? "true" : "false",
          },
          banned: {
            channel: req.body.bannedChannel,
            toggle: req.body.banned ? "true" : "false",
          },
          kick: {
            channel: req.body.kickChannel,
            toggle: req.body.kick ? "true" : "false",
          },
          voice: {
            channel: req.body.voiceChannel,
            toggle: req.body.voice ? "true" : "false",
          },
          guildMemberAdd: {
            channel: req.body.joinsChannel,
            toggle: req.body.joins ? "true" : "false",
          },
          leaves: {
            channel: req.body.leavesChannel,
            toggle: req.body.leaves ? "true" : "false",
          },
        },
      },
      {
        upsert: true
      });

    const action = "Logging Update"
    saveAction(req, res, action, guild);

    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }
    const logs = await findGuild.logs;
    if (!logs) return res.redirect(`/dashboard/${guild.id}/setup`)

    res.render("settings/logging", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      logs: logs,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.get("/dashboard/:guildID/autoline", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))
    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }
    const autoline = await Autoline.findOne({ guildId: guild.id });
    const line = await findGuild.line || "";

    res.render("settings/autoline", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      autoline: autoline,
      line: line,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.post("/dashboard/:guildID/autoline", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))
    if (!member.permissions.has(Discord.PermissionsBitField.Flags.ManageGuild))
      return res.redirect("/?error=" + encodeURIComponent("You are not allowed to do that"))
    const findGuild1 = await client.guild.findById(guild.id)
    if (!findGuild1) return res.redirect(`/dashboard/${guild.id}/setup`)


    let channels = [];
    channels.push(req.body.autolineChannel)

    await channels.forEach(async channel => {
      if (await Autoline.findOne({ channelId: channel })) return;
      await Autoline.findOneAndUpdate({ guildId: guild.id }, {
        channelId: channel,
      },
        {
          upsert: true
        });
    })

    await client.guild.findOneAndUpdate({ _id: guild.id }, {
      line: {
        link: req.body.lineLink ? req.body.lineLink : "",
      },
    },
      {
        upsert: true
      })

    const action = "Auto Line Update"
    saveAction(req, res, action, guild);

    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }

    const autoline = await Autoline.findOne({ guildId: guild.id });
    const line = await findGuild.line || "";

    res.render("settings/autoline", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      autoline: autoline,
      line: line,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.get("/dashboard/:guildID/autoreact", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))
    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }
    const autoreact = await Autoreact.find({ guildId: guild.id });

    res.render("settings/autoreact", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      autoreact: autoreact,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.post("/dashboard/:guildID/autoreact", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))
    if (!member.permissions.has(Discord.PermissionsBitField.Flags.ManageGuild))
      return res.redirect("/?error=" + encodeURIComponent("You are not allowed to do that"))
    const findGuild1 = await client.guild.findById(guild.id)
    if (!findGuild1) return res.redirect(`/dashboard/${guild.id}/setup`)


    let channels = [];
    channels.push(req.body.autoreactChannel)

    await channels.forEach(async channel => {
      console.log(channel)
      await Autoreact.create({
        channelId: channel.autoreactChannel,
        guildId: guild.id,
        toggle: channel.toggle ? "true" : "false",
        emoji: channel.emoji,
      });
    })


    const action = "Auto React Update"
    saveAction(req, res, action, guild);

    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }

    const autoreact = await Autoreact.find({ guildId: guild.id });

    res.render("settings/autoreact", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      autoreact: autoreact,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.get("/dashboard/:guildID/ultra", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))
    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }
    const action = await findGuild.action;

    res.render("settings/ultra", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      action: action,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })


  app.post("/dashboard/:guildID/ultra", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))

    await client.guild.findOneAndUpdate({ _id: guild.id }, {
      action: {
        channels: req.body.actionChannels ? req.body.actionChannels : "none",
        roles: req.body.actionRoles ? req.body.actionRoles : "none",
        bans: req.body.actionBan ? req.body.actionBan : "none",
        kicks: req.body.actionKick ? req.body.actionKick : "none",
      },
    },
    {
      upsert: true
    })
    
    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }
    
    const action = await findGuild.action;

    res.render("settings/ultra", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      action: action,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.get("/dashboard/:guildID/autorestore", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))
    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }
    const autorestore = await findGuild.autorestore;

    res.render("settings/autorestore", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      autorestore: autorestore,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })


  app.post("/dashboard/:guildID/autorestore", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))

    await client.guild.findOneAndUpdate({ _id: guild.id }, {
      autorestore: {
        channels: req.body.channels ? "true" : "false",
        roles: req.body.roles ? "true" : "false",
      },
    },
    {
      upsert: true
    })
    
    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }
    
    const autorestore = await findGuild.autorestore;

    res.render("settings/autorestore", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      autorestore: autorestore,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.get("/dashboard/:guildID/notifications", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))
    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }
    const notification = await findGuild.notification;

    res.render("settings/notifications", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      notification: notification,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })


  app.post("/dashboard/:guildID/notifications", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.render("guilds/find", {
        Discord: Discord,
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: req.params.guildID,
        bot: client,
        Permissions: Discord.PermissionsBitField,
        botconfig: Settings.website,
        callback: Settings.config.callback,
      })
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))

    await client.guild.findOneAndUpdate({ _id: guild.id }, {
      notification: req.body.notification ? "true" : "false",
    },
    {
      upsert: true
    })
    
    const findGuild = await client.guild.findById(guild.id)
    if (!findGuild) return res.redirect(`/dashboard/${guild.id}/setup`)

    const trusted = await findGuild.trust;
    const owner = await findGuild.owner;

    if (owner !== req.user.id) {
      if (!trusted.includes(member.id))
        return res.render("guilds/manage", {
          Discord: Discord,
          req: req,
          user: req.isAuthenticated() ? req.user : null,
          guild: guild,
          bot: client,
          Permissions: Discord.PermissionsBitField,
          botconfig: Settings.website,
          callback: Settings.config.callback,
        })
    }
    
    const notification = await findGuild.notification;

    res.render("settings/notifications", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      notification: notification,
      owner: owner,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  app.get("/dashboard/:guildID/setup", checkAuth, async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID)
    if (!guild)
      return res.redirect("/?error=" + encodeURIComponent("I am not in this Guild yet, please add me before!"))
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        member = await guild.members.fetch(req.user.id);
      } catch{

      }
    }
    if (!member)
      return res.redirect("/?error=" + encodeURIComponent("Login first please! / Join the Guild again!"))
    if (!member.permissions.has(Discord.PermissionsBitField.Flags.ManageGuild))
      return res.redirect("/?error=" + encodeURIComponent("You are not allowed to do that"))

    res.render("guilds/setup", {
      Discord: Discord,
      req: req,
      user: req.isAuthenticated() ? req.user : null,
      guild: guild,
      bot: client,
      Permissions: Discord.PermissionsBitField,
      botconfig: Settings.website,
      callback: Settings.config.callback,
    })
  })

  const http = require("http").createServer(app);
  http.listen(Settings.config.port, () => {
console.log(`✅ | Dashboard is online on the Port: ${Settings.config.port} ${Settings.website.domain}.`);
});

}