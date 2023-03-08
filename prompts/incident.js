const Conversation = require('../models/conversation')
const WhatsApp = require('../services/WhatsApp')
const incident = {
    key: 'incident',
    prompts: [
        {
            template: 'type_of_incident',
            needs_response: true,
            handler: async function (response, conversation) {
                //Assuming 7 incident types
                if(response == "00"){
                    const sid = conversation._id
                    conversation.status = 'closed';
                    let updateResult = await Conversation.updateOne({ _id: sid }, conversation);
                    if(updateResult){
                        await WhatsApp.sendMessage(conversation.user,{prompt:'initiate_report', data:{name: conversation.user.name}} );
                        return true
                    }
                }
                let number = Number(response);
                if (Number.isInteger(number)) {
                    if (number > 0 && number <= 7) {
                        return true;
                    }


                }
                return false;
            }
        },
        {
            template: 'incident_details',
            needs_response: true,
            handler: async function (response, conversation) {

                return true;
            }
        },
        {
            template: 'acknowledge_report',
            needs_response: false,
            handler: async function (response, conversation) {

                return true;
            }
        }
    ]
}

module.exports = incident