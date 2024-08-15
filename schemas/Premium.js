const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  _id: { type: String },
  guildId: { type: String },
  token: { type: String },
  date: { type: Number },
  use: { type: String },
  owner: { type: String },
  activity: { type: String },
  theme: { type: String },
  avatar: { type: String },
  username: { type: String },
});

module.exports = mongoose.model('Premium', UserSchema)