
const Conversation = require('../models/conversation')
const WhatsApp = require('./WhatsApp')
async function handleResponse(conversation, body, res) {
    const prompts = require('../models/session')[conversation.key].prompts;
    const sid = conversation._id;
    let lastPrompt = prompts[conversation.lastPromptIndex];
    console.log(lastPrompt)
    if (lastPrompt.needs_response) {
        let isValidResponse = await lastPrompt.handler(body.message, conversation.user);
        if (isValidResponse) {
            conversation.lastMessage.response = body.message;
            if (body.MediaUrl0) conversation.lastMessage.media0 = body.MediaUrl0;
            if (body.MediaUrl1) conversation.lastMessage.media1 = body.MediaUrl1;
            if (body.MediaUrl2) conversation.lastMessage.media2 = body.MediaUrl2;
            conversation.messages.push(conversation.lastMessage);
            await Conversation.updateOne({ _id: sid }, conversation);
            let nextPromptIndex = conversation.lastPromptIndex + 1;
            let nextPrompt = prompts[nextPromptIndex];
            let message = {
                prompt: nextPrompt.template,
                response: null,
                needs_response: nextPrompt.needs_response
            };


            await WhatsApp.sendMessage({ phone: conversation.user.phone }, message.prompt);
            conversation.lastMessage = message;
            conversation.lastPromptIndex = nextPromptIndex;
            if (!message.needs_response) // End of the line, close conversation and create report
            {
                conversation.status = 'closed';
                conversation.messages.push(conversation.lastMessage);
                if (conversation.key !== 'register') {
                    const ReportModel = require(`../models/${conversation.key}`) // key could be incident, progress, or results
                    let report = new ReportModel({
                        user: conversation.user, pu: conversation.user.pu, messages: conversation.messages
                    });
                    await report.save();
                }

            }

            updateResult = await Conversation.updateOne({ _id: sid }, conversation);
            return { message: `${conversation.lastMessage.prompt} -- ${conversation.status}` }
            //Check if prompt needs response, if it doesn't, send close conversation
            //Update Conversation
        } else {
            await WhatsApp.sendMessage({ phone: conversation.user.phone }, 'invalid-input');
            await WhatsApp.sendMessage({ phone: conversation.user.phone }, conversation.lastMessage.prompt);
            return { message: `Invalid input, ${conversation.lastMessage.prompt}` }
        }
    }

}

module.exports = handleResponse