const mongoose = require('mongoose');
const Message = mongoose.model('Message', { prompt: String, response: String, data: Map });

module.exports = Message;