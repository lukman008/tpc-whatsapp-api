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


router.post('/message',isPhoneRegistered, isOpenSession, async function (req, res) {
  
  /*
  Is this a new session
    YES - 
      Get phone number
      Check if phone number is registered
        YES, prompt for input
            1 for incident report
            2 for progress report
            3 for result update
        NO, prompt user to register PU CODE
    NO:
     Find session from DB
     Parse text and validate input
     Prompt for next step


     Middleware
      - isPhoneRegistered
      - isOpenSession
    
    Services
      - Send Message
      - Find User
      - Create New Session
      - Fetch Ongoing Session
      - handleResponse


  */
  if (!req.body.From) { //No sender information
    res.status(401).end();
    return;
  }
  req.body.phone = req.body.From.replace('whatsapp:','')
  req.body.name = req.body.ProfileName;
  req.body.message = req.body.Body; 
  if (req.registeredUser) { 
    if (req.openSession) {
      let result = await responseHandler(req.session, req.body, res);
      res.send({
        message: "Open session, next step",
        result
      })
      return
    } else {
      /*
      Start new session
      Enter 1, 2, or 3 for Incidents, progress or result reports
      */
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
          await WhatsApp.sendMessage(req.user, 'initiate_report');
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
    let existingUser = await User.findOne({phone: req.body.phone})
    if(!existingUser._id){
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
    lastMessage: null
  });

  let prompt = sessions[conversation.key].prompts[0];
  let message = {
    prompt: prompt.template,
    response: null,
    needs_response: prompt.needs_response
  };
  await WhatsApp.sendMessage({ phone: req.body.phone }, message.prompt);
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
