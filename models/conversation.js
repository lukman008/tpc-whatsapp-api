const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const conversationSchema = new Schema({ key: String, messages: [Map], status: String, _id: String, user: Map, lastPromptIndex: Number, sid: String, lastMessage: Map }, { timestamps: true })
const Conversation = mongoose.model('Conversation', conversationSchema);


module.exports = Conversation
