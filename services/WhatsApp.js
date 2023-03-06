const axios = require('axios')
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

module.exports = {
    sendMessage: async function (user, message) {
        // console.log("WhatsApp Message", {
        //     from: `whatsapp:${process.env.BOT_SID}`,
        //     body: message,
        //     to: `whatsapp:${user.phone}`
        // });
        client.messages
            .create({
                from: `whatsapp:${process.env.BOT_SID}`,
                body: message,
                to: `whatsapp:${user.phone}`
            })
            .then(message => console.log(message.sid));
    }
}