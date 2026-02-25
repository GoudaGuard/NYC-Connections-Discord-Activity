import fs from "fs";
import dotenv from "dotenv";
import gameData from './connections.json' with { type: 'json' };

dotenv.config({ path: "./.env" });
const SESSION_FILE = './userSessions.json';


//Receives Client Side Code and OAUTH SCOPES
//Fetches ACCESS_TOKEN from DISCORD OAUTH endpoint and return to client side for DISCORD_SDK INITIALIZATION
export const getToken = async (code) => {
    //const controller = new AbortController();
    //const timeout = setTimeout(() => controller.abort(), 8000); 

    try {
        const response = await fetch(`https://discord.com/api/oauth2/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
         
            body: new URLSearchParams({
                client_id: process.env.VITE_DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
            }),
        });

        //clearTimeout(timeout);
        const data = await response.json();
        
        if (!response.ok) {
            console.error("Discord Token Error:", data);
            throw new Error(data.error_description || "Failed to get token");
        }

        return data.access_token;
    } catch (err) {
        //clearTimeout(timeout);
        throw err;
    }
};

//Entry-Gate Function
//Authenticates User using client-side access_token.
//Initializes New User in Database if User not Found
//Initializes New History for User if User Found and it is New Day
export const authenticateUser = async (access_token) => {
    const date = new Date();
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    const response = await fetch('https://discord.com/api/v10/users/@me', {
        headers: { 'authorization': `Bearer ${access_token}` },
    });
    const userData = await response.json();
    const userID = userData.id;
    if (!userID) throw new Error("Discord Auth Failed");

    let sessionData = {};
    if (fs.existsSync(SESSION_FILE)) {
        sessionData = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8') || '{}');
    }

    if (!sessionData[userID]) sessionData[userID] = [];
    const userHistory = sessionData[userID];

    // FIX: Look for today's entry anywhere in the array, not just the last index
    let currentEntry = userHistory.find(entry => entry.date === dateString);

    if (!currentEntry) {
        currentEntry = {
            date: dateString,
            gameProgressforDate: { lives: 4, history: [], solved: [] }
        };
        userHistory.push(currentEntry);
        fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));
    }

    return { userID, sessionData, currentEntry };
};

export const loadProgress = async (access_token) => {
    const { currentEntry } = await authenticateUser(access_token);
    const progress = currentEntry.gameProgressforDate;
    
    const wordBank = getWords();
    const solvedWords = progress.solved.flatMap(s => s.category_words);

    return {
        words: wordBank.filter(word => !solvedWords.includes(word)),
        solved: progress.solved,
        lives: progress.lives
    };
};

export const checkGuess = async (guess, access_token) => {
    const { sessionData, currentEntry } = await authenticateUser(access_token);
    const progress = currentEntry.gameProgressforDate;
    const latestPuzzle = gameData[gameData.length - 1];

    const currentGuessSorted = [...guess].sort().join(",").toUpperCase();
    if (progress.history.some(h => [...h.guess].sort().join(",").toUpperCase() === currentGuessSorted)) {
        return { success: true, isCorrect: false, message: "Already Guessed" };
    }

    let maxCorrect = 0;
    let matchedCategory = null;

    latestPuzzle.answers.forEach(category => {
        const count = guess.filter(word => 
            category.members.map(m => m.toUpperCase()).includes(word.toUpperCase())
        ).length;
        
        if (count > maxCorrect) {
            maxCorrect = count;
            matchedCategory = category;
        }
    });

    const result = {
        success: true,
        isCorrect: maxCorrect === 4,
        message: maxCorrect === 4 ? "Correct!" : (maxCorrect === 3 ? "One away..." : "Not even close!"),
        group: maxCorrect === 4 ? matchedCategory.group : null,
        level: maxCorrect === 4 ? matchedCategory.level : null
    };

    updateSession(sessionData, progress, guess, result);
    return result;
};

const updateSession = (sessionData, progress, guess, result) => {
    progress.history.push({ guess, isCorrect: result.isCorrect, timestamp: new Date().toISOString() });

    if (result.isCorrect) {
        progress.solved.push({
            category: result.group,
            category_words: guess,
            category_level: result.level
        });
    } else {
        progress.lives--;
    }

    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));
};

//Called when Client determines loss of game after four attemps
//Compares Already Solved categories from User History and Connections Puzzle Data Base
//Returns the Remaining Categories and Necessary Data
export const finishGame = async (access_token) => {
    const { sessionData, currentEntry } = await authenticateUser(access_token);
    const progress = currentEntry.gameProgressforDate;
    const latestPuzzle = gameData[gameData.length - 1];
    let remainingSolutions = [];

    latestPuzzle.answers.forEach(answer => {
        if (!progress.solved.some(s => s.category === answer.group)) {
            const sol = { category: answer.group, category_words: answer.members, category_level: answer.level };
            remainingSolutions.push(sol);
            progress.solved.push(sol);
        }
    });

    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));
    return remainingSolutions;
};

const getWords = () => {
    const latestPuzzle = gameData[gameData.length - 1];
    const words = latestPuzzle.answers.flatMap(c => c.members);
    const prng = mulberry32(getDailySeed());
    return seededShuffle([...words], prng);
};

const mulberry32 = (seed) => () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

const seededShuffle = (array, prng) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(prng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const getDailySeed = () => {
    const d = new Date();
    return (d.getFullYear() * 10000) + ((d.getMonth() + 1) * 100) + d.getDate();
};