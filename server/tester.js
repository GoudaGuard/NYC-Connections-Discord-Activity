
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
                name: "Launch",
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

register();

async function testWebHook(){
    const response = await fetch(webhookURL, {
        method:"POST",  
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "Cheese " })
    });
}
