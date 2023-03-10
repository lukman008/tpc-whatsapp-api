const templates = {
    //     welcome: function (data) {
    //         let name = typeof data === 'object' ? data.name : 'there'
    //         return `Hi ${name},

    // Welcome to The People's Count. This is a bot that you can use to:

    //     - Upload your polling unit result sheet
    //     - Upload a video of votes being counted
    //     - Report an incident

    // See yours and other people's submissions on our Twitter account @thepeoplescount. Push the button below to get started`
    //     },
    welcome: function (data) {
        let name = typeof data === 'object' ? data.name : 'there'
        return `The People’s Count.  
This is a bot that you can use to:
-  Upload your polling unit result sheet
- Upload a video of votes being counted
-  Report an incident
See yours and other people’s submissions on our Twitter account @thepeoplescount. Push the button below to get started`
    },
    know_your_pu: function (data) {
        return `Thank you for volunteering to be a Citizen Observer and doing your part to make sure that every vote is counted. 
        Let's get started. Do you know your polling unit code?`
    },
    collect_pu: function (data) {
        return `Enter your polling unit code in this format (24-00-00-000)
    
_Respond with *00* to go back to the previous menu_
    `
    },
    collect_lga: function (data) {
        let lgas = data.lgas;
        let message = `
    Choose your Local Government Area

    `
        lgas.forEach((lga) => {
            message += `\n${lga.index}. ${lga._id} `
        })
        message += `\n00. Go to previous menu.
    \n
_Respond with the corresponding number of the LGA. For example, reply with *${lgas[0].index}* if you want to choose *${lgas[0]._id}*_`
        return message
    },
    collect_ward: function (data) {
        let wards = data.wards;
        let message = `
        *${data.lga} LGA*

        \n Choose your Ward

        (type just the number from below)`
        wards.forEach((ward) => {
            message += `\n${ward.index}. ${ward._id} `
        })
        message += `\n00. Go to previous menu.
        \n
_Respond with the corresponding number of the LGA. For example, reply with *${wards[0].index}* if you want to choose *${wards[0]._id}*_`


        return message
    },
    collect_pu_name: function (data) {
        let pus = data.pus;
        console.log("PUs length", pus.length);
        let message = `
        *${data.lga} LGA*
        \n *${data.ward}*

        \n Choose your Polling Unit

        (type just the number from below)`
        pus.forEach((pu) => {
            message += `\n${pu.index}. ${pu._id} `
        })
        console.log("Text length", message.length)
        return message
    },
    confirm_details: function (data) {
        return ` Type *YES* to confirm that these details are correct, otherwise type *NO*
    ${data.pu_code}
    Polling unit: ${data.pu_address}
    LG: ${data.lga}
    Ward: ${data.ward}
        
        `
    },
    registration_complete: function (data) {
        return `Alright ${data.name}, you’re all set. Now all your reports and uploads will be attached to this polling unit.
    ${data.pu_code}
    Polling unit: ${data.pu_name}
    LG: ${data.lga}
    Ward: ${data.ward}
        `
    },
    invalid_input: function (data) {
        return `Your previous input was invalid, please try again`
    },
    //     initiate_report: function (data) {
    //         return `
    //     Hi ${data.name}, What would you like to do?
    //  1.   Report an incident
    //  2.   Upload result sheet
    //  3.   Upload video of vote count

    // _Respond with the corresponding number of the incident. For example, respond with *1* if you want to *Report an incident*_
    //     `
    //     },
    initiate_report: function (data) {
        return `Hi ${data.name},

What would you like to do?`
    },
    type_of_incident: function (data) {
        return `
        What's happening at your polling unit.

1.  Late or no show INEC officials
2.  Official abuse of power: e.g., INEC officials not allowing certain people vote, not counting legitimate votes, etc.
3.  Missing voting materials, e.g., no ink, no ballots, etc.
4.  Voter intimidation, e.g., violence, threats, or coercion from thugs or other civilians.
5.  Voter fraud, e.g., mass thumb printing, voting for someone else
6.  BVAS malfunction / server error / technical issues
7.  Missing party agent(s).
9.  Results not uploaded after INEC officials left the unit
10. Other
00. Go back to previous menu

_Respond with the corresponding number of the incident. For example, reply with *1* if you want to report *Late or no show INEC officials*_




        `
    },
    incident_details: function (data) {
        `
        Please share picture or video evidence if you have it, or reply *NO* if you don't.`
    }
}

module.exports = templates

