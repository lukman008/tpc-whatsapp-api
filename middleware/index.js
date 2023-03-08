
const User = require('../models/user')
const Conversation = require('../models/conversation');
const isPhoneRegistered = async function (req, res, next) {
  let phone = req.body.From.replace('whatsapp:','')

    let registeredUser = await User.findOne({ phone })
    if (registeredUser && registeredUser._id) {
      req.registeredUser = true;
      req.user = JSON.parse(JSON.stringify(registeredUser));
    }
    next();
  }
  
  const isOpenSession = async function (req, res, next) {
    let phone = req.body.From.replace('whatsapp:','')
    let openConversation = await Conversation.findOne({ status: 'open', 'user.phone': phone});
    if (openConversation && openConversation._id) {
      req.openSession = true;
      req.session = JSON.parse(JSON.stringify(openConversation));
      next()
      return
    }
    req.openSession = false;
    next()
  }

  module.exports = {
    isOpenSession,
    isPhoneRegistered
  }