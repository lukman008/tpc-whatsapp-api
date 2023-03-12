var express = require('express');
var router = express.Router();
const Conversation = require('../models/conversation');
const ConversationService = require('../services/Conversation');
const sessions = require('../models/session');
const responseHandler = require('../services/ResponseHandler')
const User = require('../models/user')
const WhatsApp = require('../services/WhatsApp');
const uniqid = require('uniqid');
const { isOpenSession, isPhoneRegistered } = require('../middleware')
const client = require('twilio');

// Your Auth Token from twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN;
function isValidWebhook(body, signature, url) {
  return client.validateRequest(authToken, signature, url, body);
}



router.post('/message', isPhoneRegistered, isOpenSession, async function (req, res, next) {
  try {
    console.log(req.hostname, req.path)
    let url = `https://${req.hostname+req.path}`;
    const signature = req.get('X-Twilio-Signature');
    if (!isValidWebhook(req.body, signature, url)) {
      return res.status(401).end();
    }
    if (!req.body.From) {
      return res.status(400).send({ message: "Sender information is missing" });
    }

    const phone = req.body.From.replace('whatsapp:', '');
    const name = req.body.ProfileName;
    const message = req.body.ButtonText ? req.body.ButtonText : req.body.Body;

    if (req.registeredUser) {
      if (req.openSession && req.user.pu_code) {
        const result = await responseHandler(req.session, req.body, res);
        return res.send({ message: "Open session, next step", result });
      } else if (!req.user.pu_code && req.openSession) {
        let conversation = req.session;
        if (conversation.key === 'register') {
          const result = await responseHandler(req.session, req.body, res);
          return res.send({ message: "Open session, next step", result });
        } else {
          conversation.status = 'closed';
          let close_result = await Conversation.updateOne({ _id: conversation._id }, conversation);
          await WhatsApp.sendMessage(conversation.user, { prompt: 'welcome', data: { name: conversation.user.name } });
          return;
        }
      } else {
        switch (message) {
          case 'Report an incident':
            await ConversationService.new('incident', req.user);
            break;
          case 'Add vote count video':
            await ConversationService.new('video', req.user);
            break;
          case 'Upload result sheet':
            await ConversationService.new('results', req.user);
            break;
          default:
            if (req.user.pu_code) {
              await WhatsApp.sendMessage(req.user, { prompt: 'initiate_report', data: { name } });
            }
            break;
        }
        return res.send({ message: "Starting new session" });
      }
    } else {
      const user = new User({ phone, name });
      const existingUser = await User.findOne({ phone });
      if (!existingUser) {
        await user.save();
      }
    }

    const conversation = new Conversation({
      _id: uniqid('sid-'),
      key: 'register',
      status: 'open',
      user: { phone, name },
      messages: [],
      lastPrompt: null,
      lastMessage: null,
    });

    const prompt = sessions[conversation.key].prompts[0];
    const messageToSend = {
      prompt: prompt.template,
      response: null,
      needs_response: prompt.needs_response,
      data: { name }
    };
    await WhatsApp.sendMessage({ phone }, messageToSend);
    conversation.lastMessage = messageToSend;
    conversation.lastPromptIndex = 0;
    await conversation.save();

    return res.send({ message: messageToSend.prompt, phone, eof: true });

  } catch (err) {
    console.error(err)
  }
});

router.post('/callback', function (req, res) {
  res.send("OK");
});

router.get('/callback', function (req, res) {
  res.send("OK");
});



module.exports = router;
