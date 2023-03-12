const VoteVideo = require('../models/voteVideo')

const voteVideo = {
    key: 'video',
    prompts: [
       
        {
            template: 'vote_video',
            needs_response: true,
            handler:async function(response,conversation, media){
                const user = conversation.user;
                if(!media){
                    return false;
                }
                let video = new VoteVideo({
                    caption: response,
                    media,
                    pu_code: user.pu_code,
                    pu_address: user.pu_address
                })
                let video_result = await video.save();
                if(video_result){
                    return {
                        next_prompt:'acknowledge_report',
                        valid: true,
                        data:{
                            
                        }
                    }
                }
                return false
            }
        },
        {
            template: 'acknowledge_report',
            needs_response: false
        }
    ]
}

module.exports = voteVideo;