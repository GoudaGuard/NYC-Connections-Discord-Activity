import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path'; // Added missing import
import gameData from './connections.json' with { type: 'json' };

export async function processGridUpdate(channel_ID, token = null, messageId = null, userID) {
    const timeStamp = Date.now();
    const buffer = await generateGrid(userID);
    const fileName = `grid_${timeStamp}.png`;

    const formData = new FormData();
    const imageFile = new Blob([buffer], { type: 'image/png' });
    formData.append('files[0]', imageFile, fileName);

    if (token) {
        formData.append('payload_json', JSON.stringify({
            content: "Here is your grid!",
            attachments: [{ id: 0, filename: fileName }]
        }));
        
        // ADDED THE MISSING FETCH CALL
        const response = await fetch(`https://discord.com/api/v10/webhooks/${process.env.VITE_DISCORD_CLIENT_ID}/${token}`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Discord Webhook failed: ${errorText}`);
        }

        // Webhooks often return 204 No Content, so we need to check before parsing JSON
        if (response.status === 204) return null; 
        
        const data = await response.json();
        return data.id; 
    } 
    else if (messageId) {
        formData.append('payload_json', JSON.stringify({
            attachments: [{ id: 0, filename: fileName }]
        }));

        const response = await fetch(`https://discord.com/api/v10/channels/${channel_ID}/messages/${messageId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
            },
            body: formData
        });

        return await response.json();
    }
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

    const canvas = createCanvas(320, 320);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#302b2b';
    ctx.fillRect(0, 0, 320, 320);

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