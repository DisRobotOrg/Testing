const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    guildId: { type: String },
    message: { type: String },
    reply: { type: String },
});

module.exports = mongoose.model('Autoreply', UserSchema)