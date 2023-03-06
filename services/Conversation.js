const Conversation = require('../models/conversation');
const uniqid = require('uniqid')
const sessions = require('../models/session')
const WhatsApp = require('./WhatsApp')
module.exports = {
    new: async function(key, user){
        let conversation = new Conversation({
            _id: uniqid('sid-'),
            key: key,
            status: 'open',
            user,
            messages: [],
            lastPrompt: null,
            lastMessage: null
          });
        
          let prompt = sessions[conversation.key].prompts[0];
          let message = {
            prompt: prompt.template,
            response: null,
            needs_response: prompt.needs_response
          };
          await WhatsApp.sendMessage({phone: user.phone}, message.prompt);
          conversation.lastMessage = message;
          conversation.lastPromptIndex = 0;
          await conversation.save();
          return true
    }
}