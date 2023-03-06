const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({ phone: String, pu_code: String, name: String, pu_address: String }, { timestamps: true })
const User = mongoose.model('User', userSchema);

module.exports = User;