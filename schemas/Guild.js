const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: false,
    },
    language: {
        type: String,
        required: false,
    },
    owner: {
        type: String,
    },
    notification: {
        type: String,
    },
    commands: {
        type: String,
    },
    prefix: {
        type: String,
    },
    line: {
        link: { type: String },
    },
    reaction: {
        channel: { type: String },
        emoji: { type: String },
    },
    slowmode: {
        channel: { type: String },
        time: { type: String },
    },
    autorestore: {
        channels: { type: String },
        roles: { type: String },
    },
    premium: {
        token: { type: String },
        user: { type: String },
        time: { type: String },
    },
    autorole: {
        roles: { type: String },
        toggle: { type: String },
    },
    welcome: {
        channel: { type: String },
        toggle: { type: String },
    },
    trust: { type: Array },
    protection: {
        antibot: {
            type: String
        },
        antihack: {
            type: String
        },
        antilink: {
            roles: { type: String },
            toggle: { type: String },
            action: { type: String },
        },
        antispam: {
            messages: { type: String },
            toggle: { type: String },
            action: { type: String },
        },
    },
    limit: {
        channels: {
            type: String
        },
        bans: {
            type: String
        },
        kicks: {
            type: String
        },
        roles: {
            type: String
        },
    },
    action: {
        channels: {
            type: String
        },
        bans: {
            type: String
        },
        kicks: {
            type: String
        },
        roles: {
            type: String
        },
    },
    ticket: {
        channel: {
            type: String
        },
        catrogy: {
            type: String
        },
        embed: {
            title: { type: String },
            description: { type: String },
            button: { type: String },
        },
    },
    logs: {
        message: {
            channel: { type: String },
            toggle: { type: String },
        },
        channel: {
            channel: { type: String },
            toggle: { type: String },
        },
        role: {
            channel: { type: String },
            toggle: { type: String },
        },
        banned: {
            channel: { type: String },
            toggle: { type: String },
        },
        kick: {
            channel: { type: String },
            toggle: { type: String },
        },
        voice: {
            channel: { type: String },
            toggle: { type: String },
        },
        guildMemberAdd: {
            channel: { type: String },
            toggle: { type: String },
        },
        leaves: {
            channel: { type: String },
            toggle: { type: String },
        },
    }
});

module.exports = mongoose.model('Guild', GuildSchema)