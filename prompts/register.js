const User = require('../models/user');
const register = {
    key: 'register',
    prompts: [
        {
            template: 'welcome',
            needs_response: true,
            handler: function (response, user) {
                return response.trim().toLowerCase() === 'register';
            }
        },
        {
            template: 'collect_pu',
            needs_response: true,
            handler: async function (response, user) {
                let pattern = /^\d{2}\/\d{2}\/\d{2}\/\d{3}$/;
                if(!pattern.test(response)){
                    return false;
                };
                //Check PU Code against list of PUs in lagos
                let updateResult = await User.updateOne({phone: user.phone}, {pu_code: response, pu_address: "Lorem Ipsum"});
                return true;
            },
        },
        {
            template: 'confirm_details',
            needs_response: true,
            handler: function (response, user) {
                return response.trim().toLowerCase() === 'yes';
            }
        },
        {
            template: 'registration_complete',
            needs_response: false,
            handler: function () {
                return true
            }
        }
    ]
}

module.exports = register;