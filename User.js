const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  loginTime: Date,
});

const User = mongoose.model('User', UserSchema);
