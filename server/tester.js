
const date =  new Date();
const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
console.log(dateString);
const webhookURL="https://discordapp.com/api/webhooks/1475708359712702598/a7kCtOD6ENYl8qa2mB0YhppVCI7DJvO4cJZyY7vNoMKh0U6UgYHFBFnMOx-h3zwOqL-q"
import dotenv from "dotenv";
dotenv.config({ path: "./.env", override: true });

const APP_ID= process.env.DISCORD_APP_ID;
const BOT_TOKEN=process.env.DISCORD_BOT_TOKEN;

// registerEntryPoint.js
const register = async () => {
    // Make sure these are strictly strings of numbers in your .env
    const response = await fetch(`https://discord.com/api/v10/applications/${APP_ID}/commands`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bot ${BOT_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify([
            {
                name: "launch",
                type: 4,              // PRIMARY_ENTRY_POINT
                handler: 1,           // 1 = Manual (Your server handles it)
                integration_types: [0, 1], // 0: Guild, 1: User (Required for Group DMs)
                contexts: [0, 1, 2] ,  // 0: Guild, 1: Bot DM, 2: Group DM
                
                handler_config: {
                    type: 2, // Tells Discord this handler is specifically for an Activity
                    launch_context: {
                        scopes: ["identify", "guilds", "applications.commands", "webhook.incoming"]
                    }
                    }
                    
                }
                    
        ])
    });

    const data = await response.json();
    console.dir(data, { depth: null });
};

//register();

async function testWebHook(){
    const response = await fetch(webhookURL, {
        method:"POST",  
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "Cheese " })
    });
    }

    async function checkCommand(){
        const response = await fetch(`https://discord.com/api/v10/applications/${APP_ID}/commands`, {
            method: 'Get',
            headers: {
                'Authorization': `Bot ${BOT_TOKEN}`,
                'Content-Type': 'application/json',
            },
    });
    const data = await response.json();
        console.dir(data, { depth: null });
    }

//checkCommand();


async function testBotMessage(){
    const channel_id = '1479202875438665828';
    const message_id = '1479210470429692064';


    const response = await fetch(`https://discord.com/api/v10/channels/${channel_id}/messages/${message_id}`,{
        method: "DELETE",
        headers:{
            Authorization: `Bot ${BOT_TOKEN}`,
            
        },
        
    });
    const data = await response.json();
    console.log("Response for http request to delete discord message: ", data);
}
//testBotMessage();
/*
export async function addBotToGroupDM(channel_id, access_token) {
        //const channel_id = '1479202875438665828';
  
  
        console.log("APP_ID value:", APP_ID); // ← add this
        console.log("access_token:", access_token); // ← and this
        const channelInfo = await fetch(`https://discord.com/api/v10/channels/${channel_id}`, {
        headers: { Authorization: `Bearer ${access_token}` }
        });
        const info = await channelInfo.json();
        console.log("Channel type:", info.type);
        //const userAccessToken = 'MTQ2ODAyNzEzNjYyMjQ2NTI1MA.LdT6GIjUqidOLYO3XUsJbVeExcnury'
    const response = await fetch(
        `https://discord.com/api/v10/channels/${channel_id}/recipients/${APP_ID}`,
        {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${access_token}`, // user token, NOT bot token
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            access_token: access_token,
        }),
        }
    );
    const data = await response.status;
        console.log("Response for http request to add Bot: ", data);

        }
*/