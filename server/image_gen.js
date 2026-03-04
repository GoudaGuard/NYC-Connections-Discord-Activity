import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path'; // Added missing import
import gameData from './connections.json' with { type: 'json' };



export async function processGridUpdate(token, userID) {
    // 1. Pull the session to get the last message ID
    const sessionPath = path.resolve('./userSessions.json');
    const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8') || '{}');
    const userSession = sessionData[userID]?.[sessionData[userID].length - 1];
    
    //const webhookURL ="https://discordapp.com/api/webhooks/1475708359712702598/a7kCtOD6ENYl8qa2mB0YhppVCI7DJvO4cJZyY7vNoMKh0U6UgYHFBFnMOx-h3zwOqL-q"
    const buffer = await generateGrid(userID);
    const fileName = `grid_${Date.now()}.png`;

    const formData = new FormData();
    const imageFile = new Blob([buffer], { type: 'image/png' });
    formData.append('files[0]', imageFile, fileName);

    const payload = {
        content: "🧩 **Connections Grid**",
        components: [{
            type: 1,
            components: [{
                type: 2,
                style: 1, // Link Button
                label: "Play Now",
                url: `https://discord.com/activities/${process.env.VITE_DISCORD_CLIENT_ID}`
            }]
        }]
    };
    formData.append('payload_json', JSON.stringify(payload));
    console.log("Generated image and gettitng ready to send");
    const response = await fetch(`https://discord.com/api/v10/webhooks/${process.env.VITE_DISCORD_CLIENT_ID}/${token}`,{
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: formData,
        
    }
 

    );
       const data = await response.json();
        console.log("Response of POST to token: ", data);
    // 2. Logic: POST if no message exists, PATCH if it does
    //const lastMessageId = userSession?.lastMessageId;

}

export async function generateGrid(userID) {
    let sessionData = {};
    const sessionPath = path.resolve('./userSessions.json'); // Fixed path resolution
    
    if (fs.existsSync(sessionPath)) {
        sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8') || '{}');
    }

    const userHistory = sessionData[userID];
    
    if (!userHistory || userHistory.length === 0) {
        throw new Error(`User ${userID} not found in session data`);
    }

    const currentEntry = userHistory[userHistory.length - 1];
    const history = currentEntry.gameProgressforDate.history;
    const currentPuzzle = gameData[gameData.length - 1];

    const canvas = createCanvas(400, 600);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#302b2b';
    ctx.fillRect(0, 0, 600, 400);

    const colorMap = {
        0: "#f9df6d", // Yellow
        1: "#a0c35a", // Green
        2: "#b0c4ef", // Blue
        3: "#ba81c5"  // Purple
    };

    const wordToColor = {};
    currentPuzzle.answers.forEach((category, index) => {
        category.members.forEach(word => {
            wordToColor[word.toUpperCase()] = colorMap[index];
        });
    });

    for (let row = 0; row < 4; row++) {
        const attempt = history[row]; 

        for (let col = 0; col < 4; col++) {
            let boxColor = '#efefe6'; 

            if (attempt && attempt.guess && attempt.guess[col]) {
                const word = attempt.guess[col]; 
                boxColor = wordToColor[word.toUpperCase()] || '#7f7f7f'; 
            }

            ctx.fillStyle = boxColor;
            ctx.beginPath();
            ctx.roundRect(10 + (col * 75), 10 + (row * 75), 70, 70, 10);
            ctx.fill();
        }
    }

    return canvas.toBuffer('image/png');
}

