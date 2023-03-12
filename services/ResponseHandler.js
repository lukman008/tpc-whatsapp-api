const Conversation = require('../models/conversation');
const WhatsApp = require('./WhatsApp');
const sessionModel = require('../models/session');
const { isBoolean, isObject } = require('lodash');

async function handleResponse(conversation, body, res) {
  try {
    const prompts = sessionModel[conversation.key].prompts;
    const sid = conversation._id;
    let lastPrompt = prompts[conversation.lastPromptIndex];
    if (lastPrompt.needs_response) {
      let isValidResponse = await lastPrompt.handler(body.Body, conversation, body.MediaUrl0);
      if (isValidResponseIsValid(isValidResponse)) {
        conversation.lastMessage.response = body.Body;
        if (body.MediaUrl0) conversation.lastMessage.media0 = body.MediaUrl0;
        conversation.messages.push(conversation.lastMessage);
        await Conversation.updateOne({ _id: sid }, conversation);
        let nextPromptIndex = conversation.lastPromptIndex + 1;
        let nextPrompt = prompts[nextPromptIndex];
        if (isObject(isValidResponse) && isValidResponse.next_prompt) {
          let presetPrompt = prompts.filter((prompt, index) => {
            if (prompt.template === isValidResponse.next_prompt) {
              nextPromptIndex = index;
              return prompt;
            }
          });
          nextPrompt = presetPrompt[0];
        }
        let message = {
          prompt: nextPrompt.template,
          response: null,
          needs_response: nextPrompt.needs_response,
        };
        if (isObject(isValidResponse)) {
          message.data = isValidResponse.data;
        }
        await sendMessage(conversation.user, message);
        conversation.lastMessage = message;
        conversation.lastPromptIndex = nextPromptIndex;
        if (!message.needs_response) {
          conversation.status = 'complete';
          conversation.messages.push(conversation.lastMessage);
          if (conversation.key !== 'register') {
            const ReportModel = require(`../models/${conversation.key}`);
            let report = new ReportModel({
              user: conversation.user,
              pu: conversation.user.pu,
              messages: conversation.messages,
            });
            await report.save();
          }
        }
        updateResult = await Conversation.updateOne({ _id: sid }, conversation);
        return { message: `${conversation.lastMessage.prompt} -- ${conversation.status}` };
      } else {
        await sendMessage(conversation.user, {
          prompt: 'invalid_input',
          data: { message: isValidResponse.message },
        });
        await sendMessage(conversation.user, conversation.lastMessage);
        return { message: `Invalid input, ${conversation.lastMessage.prompt}` };
      }
    }
  } catch (error) {
    console.error('Error handling response: ', error);
    throw new Error('Error handling response');
  }
}

async function sendMessage(user, message) {
  console.log(message)
  await WhatsApp.sendMessage(user, message);
}

function isValidResponseIsValid(isValidResponse) {
  return (isBoolean(isValidResponse) && isValidResponse) || (isObject(isValidResponse) && isValidResponse.valid);
}

module.exports = handleResponse;