
const Results = require('../models/results')
const WhatsApp = require('../services/WhatsApp')
const Conversation = require('../models/conversation')
const results = {
    key: 'results',
    prompts: [
        {
            template: 'confirm_results_counted',
            needs_response: true,
            handler: async function (response, conversation) {
                if (response.trim().toLowerCase() === 'yes') {
                    return {
                        valid: true,
                        next_prompt:'result_evidence',
                        data:{
                        }
                    };
                }else if(response.trim().toLowerCase() === 'no'){
                    conversation.status = 'closed';
                    let close_result = await Conversation.updateOne({ _id: conversation._id }, conversation);
                    let message = {
                        prompt: 'results_not_signed',
                        data:{
                            status:'not_signed'
                        }
                    }
                    WhatsApp.sendMessage(conversation.user,message )
                    return {
                        valid: true,
                        next_prompt:'acknowledge_result',
                        data:{}
                    }
                }
                return false;
            }
        },
        {
            template: 'result_evidence',
            needs_response: true,
            handler: async function (response, conversation, media) {
                if (!media) {
                    return false;
                }
                return {
                    valid: true,
                    next_prompt: 'apc_count',
                    data: {
                        image:media
                    }
                }
            }
        },
        {
            template: 'apc_count',
            needs_response: true,
            handler:async function (response, conversation) {
                let previousMessage = conversation.lastMessage;
                let previousMessageData = previousMessage.data
                if(response === '00'){
                    return {
                        next_prompt: 'result_evidence',
                        valid: true,
                        data: {
                        }
                    }
                }
                let number = Number(response);
                if (Number.isInteger(number)) {
                    return {
                        valid: true,
                        next_prompt: 'labour_count',
                        data: {
                            apc_count: number,
                            image: previousMessageData.image
                        }
                    }

                }
                return false;
            }
        },
        {
            template: 'labour_count',
            needs_response: true,
            handler: async function (response, conversation) {
                let previousMessage = conversation.lastMessage;
                let previousMessageData = previousMessage.data
                if(response === '00'){
                    return {
                        next_prompt: 'apc_count',
                        valid: true,
                        data: {
                            image: previousMessageData.image
                        }
                    }
                }
                let number = Number(response);
                if (Number.isInteger(number)) {
                    return {
                        valid: true,
                        next_prompt: 'pdp_count',
                        data: {
                            apc_count: previousMessageData.apc_count,
                            image: previousMessageData.image,
                            lp_count: number
                        }
                    }

                }
                return false;
            }
        },
        {
            template: 'pdp_count',
            needs_response: true,
            handler: async function (response, conversation) {
                let previousMessage = conversation.lastMessage;
                let previousMessageData = previousMessage.data
                if(response === '00'){
                    return {
                        next_prompt: 'labour_count',
                        valid: true,
                        data: {
                            apc_count: previousMessageData.apc_count,
                            image: previousMessageData.image
                        }
                    }
                }
                let number = Number(response);
                if (Number.isInteger(number)) {
                    return {
                        valid: true,
                        next_prompt: 'others_count',
                        data: {
                            apc_count: previousMessageData.apc_count,
                            lp_count: previousMessageData.lp_count,
                            image: previousMessageData.image,
                            pdp_count: number
                        }
                    }

                }
                return false;
            }
        },
        {
            template: 'others_count',
            needs_response: true,
            handler: async function (response, conversation) {
                let previousMessage = conversation.lastMessage;
                let previousMessageData = previousMessage.data
                if(response === '00'){
                    return {
                        next_prompt: 'pdp_count',
                        valid: true,
                        data: {
                            apc_count: previousMessageData.apc_count,
                            lp_count: previousMessageData.lp_count,
                            image: previousMessageData.image
                        }
                    }
                }
                let number = Number(response);
                if (Number.isInteger(number)) {
                    return {
                        valid: true,
                        next_prompt: 'valid_count',
                        data: {
                            apc_count: previousMessageData.apc_count,
                            lp_count: previousMessageData.lp_count,
                            pdp_count: previousMessageData.pdp_count,
                            others_count:number,
                            image: previousMessageData.image
                        }
                    }

                }
                return false;
            }
        },
        {
            template: 'valid_count',
            needs_response: true,
            handler: async function (response, conversation) {
                let previousMessage = conversation.lastMessage;
                let previousMessageData = previousMessage.data
                if(response === '00'){
                    return {
                        next_prompt: 'others_count',
                        valid: true,
                        data: {
                            apc_count: previousMessageData.apc_count,
                            lp_count: previousMessageData.lp_count,
                            pdp_count: previousMessageData.pdp_count,
                            image: previousMessageData.image
                        }
                    }
                }
                let number = Number(response);
                if (Number.isInteger(number)) {
                    return {
                        valid: true,
                        next_prompt: 'rejected_count',
                        data: {
                            apc_count: previousMessageData.apc_count,
                            lp_count: previousMessageData.lp_count,
                            pdp_count: previousMessageData.pdp_count,
                            others_count:previousMessageData.others_count,
                            valid_count: number,
                            image: previousMessageData.image
                        }
                    }

                }
                return false;
            }
        },
        {
            template: 'rejected_count',
            needs_response: true,
            handler: async function (response, conversation) {
                let previousMessage = conversation.lastMessage;
                let previousMessageData = previousMessage.data
                if(response === '00'){
                    return {
                        next_prompt: 'valid_count',
                        valid: true,
                        data: {
                            apc_count: previousMessageData.apc_count,
                            lp_count: previousMessageData.lp_count,
                            pdp_count: previousMessageData.pdp_count,
                            others_count: previousMessageData.others_count,
                            image: previousMessageData.image
                        }
                    }
                }
                let number = Number(response);
                if (Number.isInteger(number)) {
                    return {
                        valid: true,
                        next_prompt: 'confirm_result',
                        data: {
                            apc_count: previousMessageData.apc_count,
                            lp_count: previousMessageData.lp_count,
                            pdp_count: previousMessageData.pdp_count,
                            others_count:previousMessageData.others_count,
                            valid_count: previousMessageData.valid_count,
                            image: previousMessageData.image,
                            rejected_count: number
                        }
                    }

                }
                return false;
            }
        },
        {
            template: 'confirm_result',
            needs_response: true,
            handler: async function(response, conversation){
                if(response.trim().toLowerCase() === 'yes'){
                    let final_results = conversation.lastMessage.data;
                    let final_results_db = new Results({
                        pu_code: conversation.user.pu_code,
                        pu_address: conversation.user.pu_address,
                        apc_count: final_results.apc_count,
                        pdp_count: final_results.pdp_count,
                        lp_count: final_results.lp_count,
                        image: final_results.image,
                        others_count:final_results.others_count,
                        valid_count: final_results.valid_count,
                        rejected_count: final_results.rejected_count
                    });
                    let updateResult = await final_results_db.save();
                    if(updateResult){
                        return {
                            valid: true,
                            next_prompt:'acknowledge_result',
                            data: {
                                pu_code: conversation.user.pu_code,
                                pu_address: conversation.user.pu_address
                            }
                        };
                    }
                    return false;
                }else if(response.trim().toLowerCase() === 'no'){
                    let previousMessage = conversation.messages[conversation.messages.length - 1];
                    // console.log(previousMessage.data)
                    return {
                        valid: true,
                        next_prompt:previousMessage.prompt,
                        data: previousMessage.data
                    }
                }else{
                    return false;
                }
            }
        },
        {
            template: 'acknowledge_result',
            needs_response: false
        }
    ]
}



module.exports = results