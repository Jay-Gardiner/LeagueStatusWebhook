// Packages
const Discord = require('discord.js');
const Axios = require('axios');
const Auth = require('./auth.json');

const StatusAPI = "https://oc1.api.riotgames.com/lol/status/v3/shard-data";

// Create a new instance of a Discord client
const client = new Discord.Client();
const webhookClient = new Discord.WebhookClient(Auth.WebhookID, Auth.Webhooktoken);

var lastIncidentID = 0;

client.login(Auth.Discordtoken);

client.on('ready', () => {
    console.log("I am ready!");
    RunAPICall();
    setInterval(RunAPICall, 60000);
})

// client.on('message', message => {
//     // The bot needs to know if it will execute a command
//     // It will listen for messages that will start with `!`
//     if (message.content.substring(0, 1) == '!') {
//         var args = message.content.substring(1).split(' ');
//         var cmd = args[0];
   
//         args = args.splice(1);
//         switch(cmd) {
//         // Manual way to start the bot
//             case 'CallAPI':
                
//                 setInterval(RunAPICall, 60000);
//                 break;
//         }
//     }
// });

async function RunAPICall() {
    var length;
    var mostRecentIncident;

    const response = await CallAPI();
    JSONdata = response.data;

    length = JSONdata.services[0].incidents.length;
    mostRecentIncident = JSONdata.services[0].incidents[length-1].id;

    if(lastIncidentID === mostRecentIncident) {
        console.log("No new updates");
    } else {
        lastIncidentID = mostRecentIncident;
        console.log("Last ID: " + lastIncidentID)
        console.log("Most recent ID: " + mostRecentIncident)

        sendWebhook(JSONdata, length);
    }
}

function CallAPI() {
    try {
        let response = Axios.get(StatusAPI + "?api_key=" + Auth.RiotAPItoken);
        return response;
    } catch (err) {
        console.log(err);
        return err;
    }
}

async function sendWebhook(JSONdata, length) {
    var currentStatus = JSONdata.services[0].status;
    var mostRecentUpdate = JSONdata.services[0].incidents[length-1].updates[0].content;

    var data = {
        "username": "League Status",
        "embeds": [{
            "title": "Current Status of OCE server",
            "color": 16112140,
            "fields": [{
                "name": "Status:",
                "value": currentStatus,
            },
            {
                "name": "Incident:",
                "value": mostRecentUpdate,
            }],
        }],
    };

    message = JSON.stringify(data);

    try {
        await webhookClient.send(data);
    } catch (err) {
        console.error("Error trying to send: ", err);
    }
}

