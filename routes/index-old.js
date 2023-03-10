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
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/message', isPhoneRegistered, isOpenSession, async function (req, res) {
  if (!req.body.From) { //No sender information
    res.status(401).end();
    return;
  }
  req.body.phone = req.body.From.replace('whatsapp:', '')
  req.body.name = req.body.ProfileName;
  req.body.message = req.body.Body;
  if (req.registeredUser) {
    if (req.openSession && req.registeredUser.pu_code) {
      let result = await responseHandler(req.session, req.body, res);
      res.send({
        message: "Open session, next step",
        result
      })
      return
    } else if (!req.registeredUser.pu_code && req.openSession) {
      if (req.session.key === 'register') {
        let result = await responseHandler(req.session, req.body, res);
        res.send({
          message: "Open session, next step",
          result
        })
        return
      } else {
        let conversation = req.session;
        conversation.status = 'closed';
        let updateResult = await Conversation.updateOne({ _id: sid }, conversation);
        if (updateResult) {
          await WhatsApp.sendMessage(conversation.user, { prompt: 'initiate_report', data: { name: conversation.user.name } });
        }
        return
      }
    } else {
      switch (req.body.message) {
        case '1':
          await ConversationService.new('incident', req.user);
          break;
        case '2':
          await ConversationService.new('progress', req.user);
          break;
        case '3':
          await ConversationService.new('result', req.user);
          break;
        default:
          if (req.user.pu_code) {
            await WhatsApp.sendMessage(req.user, { prompt: 'initiate_report', data: { name: req.body.name } });
          } else {

          }
          break;
      }
      res.send({
        message: "Starting new session"
      })
      return;
    }

  } else {
    let user = new User({
      phone: req.body.phone,
      name: req.body.name
    })
    let existingUser = await User.findOne({ phone: req.body.phone })
    if (!existingUser) {
      await user.save();
    }
  }
  let conversation = new Conversation({
    _id: uniqid('sid-'),
    key: 'register',
    status: 'open',
    user: {
      phone: req.body.phone,
      name: req.body.name
    },
    messages: [],
    lastPrompt: null,
    lastMessage: null,
  }); ``

  let prompt = sessions[conversation.key].prompts[0];
  let message = {
    prompt: prompt.template,
    response: null,
    needs_response: prompt.needs_response,
    data: {
      name: req.body.name
    }
  };
  await WhatsApp.sendMessage({ phone: req.body.phone }, message);
  conversation.lastMessage = message;
  conversation.lastPromptIndex = 0;
  await conversation.save();

  res.send({
    message: message.prompt,
    phone: req.body.phone,
    eof: true
  })

  // res.send("OK");
});

router.post('/callback', function (req, res) {
  // console.log(req.body);
  res.send("OK");
});

router.get('/callback', function (req, res) {
  console.log(req.query);
  res.send("OK");
});



module.exports = router;
