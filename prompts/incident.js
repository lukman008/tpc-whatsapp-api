const incident = {
    key: 'incident',
    prompts: [
        {
            template: 'type_of_incident',
            needs_response: true,
            handler: async function (response, user) {
                //Assuming 7 incident types
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
            template: 'give_incident_details',
            needs_response: true,
            handler: async function (response, user) {

                return true;
            }
        },
        {
            template: 'incident_evidence',
            needs_response: true,
            handler: async function (response, user) {

                return true;
            }
        },
        {
            template: 'acknowledge_report',
            needs_response: false,
            handler: async function (response, user) {

                return true;
            }
        }
    ]
}

module.exports = incident