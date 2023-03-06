const mongoose = require('mongoose');
const Message = mongoose.model('Message', { prompt: String, response: String });

module.exports = Message;