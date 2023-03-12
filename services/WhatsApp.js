const axios = require('axios')
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const Templates = require('./Templates')
module.exports = {
    sendMessage: async function (user, message) {
        let copyGenerator = Templates[message.prompt];
        // console.log("WhatsApp Message", {
        //     from: `whatsapp:${process.env.BOT_SID}`,
        //     body: Templates[message.prompt](message.data),
        //     to: `whatsapp:${user.phone}`
        // });
        if(!copyGenerator){
        console.log("No template found");
        return console.log("WhatsApp Message", {
            from: `whatsapp:${process.env.BOT_SID}`,
            body: Templates[message.prompt](message.data),
            to: `whatsapp:${user.phone}`
        });
        }
        let messageData = {
            from: `whatsapp:${process.env.BOT_SID}`,
            body: copyGenerator(message.data),
            to: `whatsapp:${user.phone}`
        }
        if(message.prompt === "collect_pu"){
            messageData.mediaUrl = "https://res.cloudinary.com/lukman/image/upload/v1678618040/Screenshot_2023-03-12_at_11.47.12_rcqenl.png"
        }
        client.messages
            .create(messageData)
            .then(message => console.log(message.sid));
    }
}