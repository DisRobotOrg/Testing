const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    guildId: { type: String },
    channelId: { type: Array },
    toggle: { type: String },
    emoji: { type: String },
});

module.exports = mongoose.model('Autoreact', UserSchema)