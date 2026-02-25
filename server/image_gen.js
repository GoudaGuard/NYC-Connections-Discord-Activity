import { AttachmentBuilder, EmbedBuilder, Client, GatewayIntentBits } from 'discord.js';
import { createCanvas } from 'canvas';
import { authenticateUser } from './services.js';
import dotenv from "dotenv";

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(process.env.DISCORD_BOT_TOKEN);

export async function sendEmbed(access_token, channelID) {
    const { currentEntry } = await authenticateUser(access_token);
    const history = currentEntry.gameProgressforDate.history;

    const canvas = createCanvas(400, 600);
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = '#302b2b';
    ctx.fillRect(0, 0, 320, 320);

    const colors = { true: '#a0c35a', false: '#7f7f7f', empty: '#efefe6' };

    // Draw 4x4 Grid
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const attempt = history[row];
            // If there's an attempt for this row, use its color, else use 'empty'
            ctx.fillStyle = attempt ? (attempt.isCorrect ? colors.true : colors.false) : colors.empty;
            
            ctx.beginPath();
            ctx.roundRect(10 + (col * 75), 10 + (row * 75), 70, 70, 10);
            ctx.fill();
        }
    }

    const buffer = canvas.toBuffer('image/png');
    const file = new AttachmentBuilder(buffer, { name: 'grid.png' });

    const embed = new EmbedBuilder()
        .setTitle('Connections Progress')
        .setDescription(history.length === 0 ? "Game Started!" : `Attempts: ${history.length}/4`)
        .setImage('attachment://grid.png')
        .setColor(0xF3CF05)
        .setTimestamp();

    try {
        const channel = await client.channels.fetch(channelID);
        await channel.send({ embeds: [embed], files: [file] });
    } catch (error) {
        console.error("Discord Embed Error:", error);
    }
}