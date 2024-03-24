const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['farmer', 'client'], default: 'client' },
  farm_name: { type: String },
  location: { type: String }
});

module.exports = mongoose.model('User', userSchema);
