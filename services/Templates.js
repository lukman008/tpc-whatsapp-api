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
        return `Hi ${name},

Welcome to The People’s Count, a non-partisan effort to count and report every vote in the Lagos state governorship election. 

Use this bot to:

👉🏻    Upload your polling unit result sheet
👉🏻    Upload a video of votes being counted
👉🏻    Report incidents

To stay up-to-date, you can track reports and results from polling units across Lagos state on our website www.thepeoplescount.com, as well as our Twitter @thepeoplescount.

Say “hello” to get started!`
    },
    know_your_pu: function (data) {
        return `Thank you for volunteering to be a Citizen Observer and doing your part to make sure that every vote is counted. 
Let's get started. Do you know your polling unit code?`
    },
    collect_pu: function (data) {
        return `Enter your polling unit code in this format (24-00-00-000) as seen on your PVC
    
_Respond with *00* to go back to the previous menu_
    `
    },
    collect_lga: function (data) {
        let lgas = data.lgas;
        let message = `
👉🏻  Choose your Local Government Area

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

        \n👉🏻 Choose your Ward\n`
        wards.forEach((ward) => {
            message += `\n${ward.index}. ${ward._id} `
        })
        message += `\n00. Go to previous menu.
        \n
_Respond with the corresponding number of the Ward. For example, reply with *${wards[0].index}* if you want to choose *${wards[0]._id}*_`


        return message
    },
    collect_pu_name: function (data) {
        let pus = data.pus;
        console.log("PUs length", pus.length);
        let message = `
        *LGA:${data.lga}*
        \n*Ward:${data.selectedWard}*

        \n 👉🏻 Choose your Polling Unit
`
        pus.forEach((pu) => {
            message += `\n${pu.index}. ${pu._id} `
        })
        message+='\n'
        message += `\n00. Go to previous page.`
        
        if(data.meta.page < Math.ceil(data.meta.all.length / 20)){
            message += `\n999. Go to next page.`
        }
        message+=`\n\n_Respond with the corresponding number of the Polling Unit. For example, reply with *${pus[0].index}* if you want to choose *${pus[0]._id}*_`
        return message
    },
    confirm_details: function (data) {
        console.log(data)
        return ` Type *YES* to confirm that these details are correct, otherwise type *NO*

*${data.pu_code}*
${data.pu_address}
${data.ward}
${data.lga}
        `
    },
    registration_complete: function (data) {
        console.log(data)
        return `Alright ${data.name}, you’re all set 🚀. Now all your reports and uploads will be attached to this polling unit.

*${data.pu_code}*
${data.pu_address}
${data.ward}
${data.lga}
        \n\n Send any message to start a report`
    },
    invalid_input: function (data) {
        return `Your previous input was invalid, please try again`
    },
    initiate_report: function (data) {
        return `Hi ${data.name},

What would you like to do?`
    },
    type_of_incident: function (data) {
        return `
        What's happening at your polling unit? Report any inconsistencies

1.  Late or no show INEC officials
2.  Official abuse of power: e.g., INEC officials not allowing certain people vote, not counting legitimate votes, etc.
3.  Missing voting materials, e.g., no ink, no ballots, etc.
4.  Voter intimidation, e.g., violence, threats, or coercion from thugs or other civilians.
5.  Voter fraud, e.g., mass thumb printing, voting for someone else
6.  BVAS malfunction / server error / technical issues
7.  Missing party agent(s).
8.  Results not uploaded after INEC officials left the unit
9. Other
00. Go back to previous menu

_Respond with the corresponding number of the incident. For example, reply with *1* if you want to report *Late or no show INEC officials*_




        `
    },
    incident_details: function (data) {
        return `Please share *ONE* picture or video evidence if you have it, or reply *NO* if you don't.`
    },
    acknowledge_report: function(data){
    return `Thank you! 

Track reports and results from polling units across Lagos state at www.thepeoplescount.com and on our Twitter @thepeoplescount.`
    },
    confirm_results_counted: function(data){
        return `Has the *FORM EC-8A* result sheet been signed by the INEC Presiding Officer?
        
_Reply with *Yes* or *No*_
        `
    },
    result_evidence: function(data){
        return `Please submit a photo of the GOVERNOR result sheet from your polling unit

👉🏻 ${data.user.pu_address} (${data.user.pu_code})`
    },
    apc_count: function(data){
        return `Now, please enter the total votes for each party.\n\n What's the total number of votes counted for *APC*?`
    },
    labour_count: function(data){
        return `What's the total number of votes counted for *Labour Party*?`
    },
    pdp_count: function(data){
        return `What's the total number of votes counted for *PDP*?`
    },
    others_count: function(data){
        return `What's the total number of votes for all other parties (sum)?`
    },
    valid_count: function(data){
        return `What's the total number of valid votes?`
    },
    rejected_count: function(data){
        return `What's the total number of rejected votes?`
    },
    confirm_result: function(data){
        return ` Type *YES* to confirm that these details are correct, otherwise type *NO*
\n
APC - ${data.apc_count}
LP - ${data.lp_count}
PDP - ${data.pdp_count}
Others - ${data.others_count}

Total number of valid votes -  ${data.valid_count}
Total number of rejected votes - ${data.rejected_count}

`;
    },
    acknowledge_result: function(data){
        return `Thank you! 🚀

Track reports and results from polling units across Lagos state at www.thepeoplescount.com and on our Twitter @thepeoplescount.`;
    },
    results_not_signed: function(data){
        return `Only signed and stamped FORM EC-8A result sheets are allowed to be uploaded. Please try again when the results are signed or report an incident if something happened that prevented this`
    },
    vote_video: function(data){
        return `Please submit a video of votes being counted at your polling unit.

Ensure that we can see and hear the polling agent counting from start to finish, for each party.
        
👉🏻 ${data.user.pu_address} (${data.user.pu_code})
        
        `;
    }

}

module.exports = templates

