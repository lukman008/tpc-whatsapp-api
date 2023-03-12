const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const videoSchema = new Schema({  pu_code:String, pu_address: String, media: String, caption: String }, { timestamps: true })
const video = mongoose.model('voteVideo', videoSchema);

module.exports = video;