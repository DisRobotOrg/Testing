const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    guildId: { type: String },
    channelId: { type: Array },
    toggle: { type: String },
    line: { type: String },
});

module.exports = mongoose.model('Autoline', UserSchema)