import fs from 'fs';
import cron from 'node-cron';
import dotenv from "dotenv"
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSION_FILE = path.join(__dirname, 'connections.json');


dotenv.config({ path: "./.env", override: true });


console.log("All available keys:", Object.keys(process.env).filter(key => key.includes('BOT')));

const DEVWEBHOOK= process.env.BOT_CHANNEL_WEBHOOK?.trim();
console.log("Webhook URL Length:", DEVWEBHOOK?.length);
console.log("Webhook starts with https:", DEVWEBHOOK?.startsWith('https'));

console.log(DEVWEBHOOK);
const maxAttempts = 3;
let currentAttempts=0;
const attemptDelay=120000;
let connections=[];

const sleep = (ms)=> new Promise(resolve => setTimeout(resolve, ms));

async function scrapeConnections(){
    console.log("Scraper Called");
    try{
        if(fs.existsSync(SESSION_FILE)){
            const file_content=fs.readFileSync(SESSION_FILE, 'utf-8');
            if(file_content.trim()){
                connections= JSON.parse(file_content);
                console.log("Reading Connections.json file data");
            }
        }
    }
    catch(error){
        console.log("Connections data is empty");
        connections=[];
    }
    const latestPuzzle={};
    latestPuzzle.id= connections.length > 0 ? connections[connections.length-1].id + 1 : 1;

    const date =  new Date();
    latestPuzzle.date=  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    

    console.log(connections[connections.length-1].date);
    console.log(latestPuzzle.date);
    if(connections && connections[connections.length-1].date === latestPuzzle.date){
        console.log("Puzzle Already stored in Datebase, Exiting Now");
        return;
    }


    try{
    const response = await fetch (`https://www.nytimes.com/svc/connections/v2/${latestPuzzle.date}.json`);
    const data = await response.json();
    
    

    latestPuzzle.answers = data.categories.map((entry, index)=>{
        const level=index;
        const group = entry.title;
        const members = entry.cards.map(card=>{return card.content });
        return {level:level, group:group, members:members};
    })
    connections.push(latestPuzzle);
    fs.writeFileSync(SESSION_FILE, JSON.stringify(connections, null, 2));
    currentAttempts=0;
    console.log("Pushed latest puzzle into Connections database");

    }
    catch(error){
        console.log("Cannot Fetch Puzzle from NYT, will try again after delay");
        if(currentAttempts<maxAttempts){
            currentAttempts++;
            await sleep(attemptDelay);
            console.log("Attempting to call scraper again");
            await scrapeConnections();
        }
        else{
            try{
                const response = await fetch(DEVWEBHOOK,{
                    method: "POST",
                    headers:{
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({content:"YO DEV, your scraper is broken, needs fixing"})
                });
                if(response.status !== 204){
                    const data = await response.json();
                    console.log("Discord Error: ", data);
                }
            }
            catch{
                console.log("Couldn't send msg to dev");
            }
        }
    }
    
}

export async function autoScrape() {
    console.log("Starting Scraper Automation Timer...");
    //await scrapeConnections();
    cron.schedule('40 0 * * *', async () => {
        try {
            console.log("Fetching today's puzzle...");
            await scrapeConnections();
            console.log("Daily update complete.");
        } catch (err) {
            console.error("The scheduled scrape failed:", err);
        }
    });
}


//autoScrape().catch(err => console.error("Failed to initialize cron:", err));