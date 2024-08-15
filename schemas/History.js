const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    guildId: { type: String },
    date: { type: Number },
    userId: { type: String },
    action: { type: String },
});

module.exports = mongoose.model('History', UserSchema)