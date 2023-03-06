## TPC WhatsApp API
The repository contains the API implementation for the WhatsApp Eyewitness bot.
### Overview
The bot should be used to to log observations from their polling units, namely incident reports, timeline of events, and most importantly, result sheets.
Product Doc: https://docs.google.com/document/d/1mOUcS8WzwNhTtvNef0gTTCYLhKXFe-R93Ed6G2BBw84/edit?usp=sharing

### Conversation Flow
![alt text](https://res.cloudinary.com/lukman/image/upload/v1678103116/tpc_2x_1_pyvzsa.png)
There are 4 conversation paths identified in this flow
1. Register: Collect user's phone number, WhatsApp profile name, and polling unit then save to DB. Users must complete this flow before any other.
2. Incident: Log incident reports regarding the election in a polling unit. Users start by choosing type of incident from a list, provide text description of the incident, and media evidence.
    Incident types:
    - Late or no-show polling agents
    - Election official abuse of power (e.g., not allowing someone vote, invalidating legitimate vote)
    - Missing voting materials
    - Voter intimidation (e.g., thug violence, threats, coercion)
    - Voter fraud (e.g., mass thumbprinting, voting on someone’s behalf)
    - Technical issues (i.e., with BVAS upload)

3. Progress: Log progress reports regarding the election in a polling unit to create a timeline of events. Users start by choosing type of preset checkpoints, and provide media evidence.
    Checkpoints:
    - Arrival of agents
    - Start of voting
    - End of voting
    - Start of count
    - End of count
    - Upload of results
    - Collection of duplicate sheet by party agents
    - Departure of agents

4. Results: After results have been counted, users will use this flow to submit the results. The flow starts by confirming that results have been counted, then prompts the user to enter the results for the major parties, finally, they will be asked to submit picture evidence of the result sheet.

### How this implementation works
When a user sends a message to the registered WhatsApp number, a webhook is sent to a preset URL containing the sender information, and the text. This codebase contains the webhook implementation to accepts responses from users, validates the response, save it to the DB and send the next prompt.

[routes/index.js](./routes/index.js) is the controller for handling the webhook. When a message is received, it first checks if the user has been registered;
If they haven't, it starts a new `Conversation` to register the user.
If the user has been registered, it checks for an open `Conversation`, where one exists, the message is processed as a response to the last prompt, otherwise it asks the user to start a new session. 

#### Conversations
Conversation flows are managed by the files [/prompts](./prompts). There are 4 types of conversations: register, incident, progress, and results.
Each file is a JSON object containing a `key`, and an array of `prompts`. The key indicates the type of conversation, and the prompts contain all the questions to be asked in the conversation flow. A `Prompt` 3 parameters:
1. template (string) - This is the WhatsApp template to be sent to the user.
2. needs_response (boolean) - True if the a response is expected from the user, otherwise, False. PS: All conversations should end with a prompt that doesn't require a response, i.e the last object in the prompts array should have  `needs_response` set to false
3. handler (function(response, user)) - Function to call when the user responds to this prompt, input parameters are the response text from the user, and the user object. If the response is valid, return `True`, otherwise return `False` so the user is prompted to enter response again. 
Here's a sample prompt in the [register conversation model](./prompts/register.js)

    ```js
     {
                template: 'collect_pu',
                needs_response: true,
                handler: async function (response, user) {
                    let pattern = /^\d{2}\/\d{2}\/\d{2}\/\d{3}$/;
                    if(!pattern.test(response)){
                        return false;
                    };
                    //Check PU Code against list of PUs in lagos
                    let updateResult = await User.updateOne({phone: user.phone}, 
                    {pu_code: response, pu_address: "Lorem Ipsum"});
                    return true;
                },
            },
    ```
    
This prompt is for collecting user's PU Code while registering, it uses the `collect_pu` template, and when the response is received, it matches the text against the standard regex format, and rejects it if it doesn't match.

When the bot sends a prompt that doesn't need a response, it assumes the end of the conversation, closes it then saves the report to the database.

Here's an example of a closed conversation for an incident report:
    ```
        
        {
          "_id": {
            "$oid": "6405183cb81aab7e981f8aaa"
          },
          "user": {
            "_id": "6405087afef64ecf5a21f9de",
            "phone": "+2349053267565",
            "name": "Luqman",
            "createdAt": "2023-03-05T21:24:10.914Z",
            "updatedAt": "2023-03-05T22:14:37.446Z",
            "__v": 0,
            "pu_address": "Lorem Ipsum",
            "pu_code": "24/19/10/056"
          },
          "messages": [
            {
              "prompt": "type_of_incident",
              "response": "6",
              "needs_response": true
            },
            {
              "prompt": "give_incident_details",
              "response": "Ghhh",
              "needs_response": true
            },
            {
              "prompt": "incident_evidence",
              "response": "Tr",
              "needs_response": true,
              "media0": "https://api.twilio.com/2010-04-01/Accounts/ACf4d17f9810979080b54caaef084e8ab1/Messages/MMdbf530d49b360dd8e47bc2aa34f09efd/Media/MEe2ca1ba9ed8d91fe19a7a8fe6f76b281"
            },
            {
              "prompt": "acknowledge_report",
              "response": null,
              "needs_response": false
            }
          ],
          "createdAt": {
            "$date": {
              "$numberLong": "1678055484835"
            }
          },
          "updatedAt": {
            "$date": {
              "$numberLong": "1678055484835"
            }
          },
          "__v": 0
        }
    ```
    The messages array contains the data that needs to be parsed and displayed to the public in real time. The same format is followed for all report types.
### TO-DO
- Handlers: To complete functionality of the bot, the validation handlers for incident, progress and results need to be implemented  [/prompts](./prompts)
- Message Copy - We've identified that we need at least 21 templates for all 4 conversation flows, we need all of this to be written.
- WhatsApp/Facebook/Twilio Account -  We've been using a sandbox account so far, we need our own account approved ASAP.
- Visualization tool - How will the data be displayed, input of this should determine how the data is saved.
