const Conversation = require('../models/conversation')
const WhatsApp = require('../services/WhatsApp')
const Incident = require('../models/incident')
const incident = {
    key: 'incident',
    prompts: [
        {
            template: 'type_of_incident',
            needs_response: true,
            handler: async function (response, conversation) {
                //Assuming 7 incident types
                if (response == "00") {
                    const sid = conversation._id
                    conversation.status = 'closed';
                    let updateResult = await Conversation.updateOne({ _id: sid }, conversation);
                    if (updateResult) {
                        await WhatsApp.sendMessage(conversation.user, { prompt: 'initiate_report', data: { name: conversation.user.name } });
                        return true
                    }
                }
                let number = Number(response);
                if (Number.isInteger(number)) {
                    if (number > 0 && number <= 10) {
                        let incidentType = "";
                        switch (number) {
                            case 1:
                                incidentType = "Late or no show INEC officials";
                                break;
                            case 2:
                                incidentType = "Official abuse of power";
                                break;
                            case 3:
                                incidentType = "Missing voting materials";
                                break;
                            case 4:
                                incidentType = "Voter intimidation"
                                break;
                            case 5:
                                incidentType = "Voter fraud"
                                break;
                            case 6:
                                incidentType = "BVAS malfunction / server error / technical issues"
                                break;
                            case 7:
                                incidentType = "Missing party agent(s)."
                                break;
                            case 8:
                                incidentType = "Results not uploaded after INEC officials left the unit"
                                break;
                            case 9:
                                incidentType = "Other"
                                break;
                            default:
                                break;
                        }

                        return {
                            valid: true,
                            next_prompt: 'incident_details',
                            data: {
                                incidentType
                            }
                        };
                    }


                }
                return false;
            }
        },
        {
            template: 'incident_details',
            needs_response: true,
            handler: async function (response, conversation, media) {
                let previousMessageData = conversation.lastMessage.data
                let user = conversation.user;
                let newIncident = new Incident({
                    pu_code:user.pu_code,
                    pu_address: user.pu_address,
                    caption: response,
                    type: previousMessageData.incidentType,
                    media
                })
                await newIncident.save();
                return {
                    valid: true,
                    next_prompt: 'acknowledge_report',
                    data:{

                    }
                };
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