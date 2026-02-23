import fs from "fs";
import gameData from './connections.json' with { type: 'json' };

import { proxyEventsPlugin } from "http-proxy-middleware";
const SESSION_FILE = './userSessions.json';

import dotenv from "dotenv"
dotenv.config({ path: "./.env" });




export const getToken= async (req)=>{
    console.log("Service.getToken called");
    const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.VITE_DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: req,
    }),
  });
        const data = await response.json();
        console.log("data is: ", data);
        //userID= data?.user.id;
        const access_token=data.access_token;
        //console.log("USer ID is", userID);
        return access_token;

  
}

const authenticateUser= async (access_token)=>{
    console.log("authenticateUser Endpoint Reached");
    console.log("Access Token:",access_token);
    try{
    const response =  await fetch('https://discord.com/api/v10/users/@me',{
        headers:{
            
            'authorization': `Bearer ${access_token}`,
         
        },
    });
    const userData= await response.json();
    console.log(`User Data:`, userData);
    return userData.id;
    }
    catch(error){
        console.log("Error occured: ", error);
    }
}

export const finishGame=async (access_token) => {
    const userID= await authenticateUser(access_token);
    let remainingSolutions=[];
    const latestPuzzle = gameData[0]; 
    
    
    let sessionData = {};
    try {
        if (fs.existsSync(SESSION_FILE)) {
            const fileContent = fs.readFileSync(SESSION_FILE, 'utf8');
            if (fileContent.trim()) {
                sessionData = JSON.parse(fileContent);
            }
        }
    } catch (err) {
        console.error("Failed to parse userSessions.json, resetting file:", err);
        sessionData = {};
    }
    const userDataEntryObject=sessionData[userID];
    console.log("userDataEntryObject: ", userDataEntryObject);
    console.log("userDataEntryObject.solved: ", userDataEntryObject.solved);
    console.log("LatestPuzzle", latestPuzzle);
    console.log("LatestPuzzle.group", latestPuzzle.group);

    latestPuzzle.answers.forEach(latest_puzzle_entry=>{
        if(!userDataEntryObject.solved.some(user_guessed_entry=>{return latest_puzzle_entry.group===user_guessed_entry.category})){
            const solution={
                category: latest_puzzle_entry.group,
                category_level:latest_puzzle_entry.level,
                category_words:latest_puzzle_entry.members
            }
            remainingSolutions.push(solution);
            console.log("RemainingSolutiosn has been pushed a solution: ", solution);
        }
    })
    console.log("remaining solutions: ", remainingSolutions);
    return remainingSolutions;
}


const mulberry32 = (seed) => {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
};


const seededShuffle = (array, prng) => {
    let currentIndex = array.length, randomIndex;


    while (currentIndex !== 0) {
      
        randomIndex = Math.floor(prng() * currentIndex);
        currentIndex--;


        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};


const getDailySeed = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; 
    const day = today.getDate();
    

    return (year * 10000) + (month * 100) + day;
};



const getWords = () => {
    try {
        const latestPuzzle = gameData[0];
        const words = latestPuzzle.answers.flatMap(category => category.members);

        
        const seed = getDailySeed();
        
        // Initialize the Mulberry32 generator
        const seededRandom = mulberry32(seed);

        // Shuffle and return the words
        return seededShuffle(words, seededRandom);

    } catch (err) {
        console.error("Error reading gameData:", err);
        return [];
    }
}

export const loadProgress= async (access_token)=>{
    const userID= await authenticateUser(access_token);

    console.log("loadProgress endpoint reached");
    console.log("User: ", userID, " is playing");
    console.log(typeof userID);
    let sessionData = {};
        try {
            if (fs.existsSync(SESSION_FILE)) {
                const fileContent = fs.readFileSync(SESSION_FILE, 'utf8');
                if (fileContent.trim()) {
                    sessionData = JSON.parse(fileContent);
                }
            }
        } catch (err) {
            console.error("Failed to parse userSessions.json, resetting file:", err);
            sessionData = {}; // Fallback to empty if file is corrupt
        }
         if (!sessionData[userID]) {
        sessionData[userID] = { lives: 4, history: [], solved: [] };
            }

        const userDataEntryObject = sessionData[userID];
   
    let solved_categories={};
    /*OLD VERSION*/
    /*
     solved_categories.solved= userDataEntryObject.history.filter(entry => entry.isCorrect === true).map(entry=>{
            return {category:entry.category, category_level:entry.level, category_words:entry.guess};
            
        })
            */
        solved_categories.solved=userDataEntryObject.solved;
    
        let words_already_solved=[];
        try{
        words_already_solved= solved_categories.solved.flatMap(
            category=>category.category_words)
        }
        catch(error){
            console.log("Only One Entry");
            words_already_solved=solved_categories.solved[0].category_words;
        }
        
        const word_bank=getWords();
    
       
        
        solved_categories.words=word_bank.flat().filter(word=>!words_already_solved.flat().includes(word));
        
        console.log("Solved cat ", solved_categories);

        solved_categories.lives=userDataEntryObject.lives;
        return solved_categories;
}


/**
 * Main logic for checking a user's guess.
 */
export const checkGuess = async (guess, access_token) => {
    console.log("Checking guess, Guess: ", guess, "Access Token: ", access_token);
    const userID= await authenticateUser(access_token);


    const latestPuzzle = gameData[0]; 
    
    
    let sessionData = {};
    try {
        if (fs.existsSync(SESSION_FILE)) {
            const fileContent = fs.readFileSync(SESSION_FILE, 'utf8');
            if (fileContent.trim()) {
                sessionData = JSON.parse(fileContent);
            }
        }
    } catch (err) {
        console.error("Failed to parse userSessions.json, resetting file:", err);
        sessionData = {};
    }

    // 2. Already Guessed Logic
    const userSession = sessionData[userID];
    if (userSession && userSession.history) {
        const currentGuessSorted = [...guess].sort().join(",").toUpperCase();
        
        const alreadyGuessed = userSession.history.some(entry => {
            // entry.guess is the array we stored in updateUserHistory
            return [...entry.guess].sort().join(",").toUpperCase() === currentGuessSorted;
        });

        if (alreadyGuessed) {
            return { success: true, isCorrect: false, message: "Already Guessed" };
        }
    }

    // 3. Comparison Logic (The "One Away" layer)
    let maxCorrect = 0;
    let matchedCategory = null;

    latestPuzzle.answers.forEach(category => {
        const intersection = guess.filter(word => 
            category.members.map(m => m.toUpperCase()).includes(word.toUpperCase())
        );
        
        const count = intersection.length;
        if (count > maxCorrect) {
            maxCorrect = count;
            matchedCategory = category;
        }
    });

    // 4. Determine Response
    let result = { success: false, message: "", isCorrect: false };

    if (maxCorrect === 4) {
        result = { 
            success: true, 
            isCorrect: true, 
            message: "Correct!", 
            group: matchedCategory.group,
            level: matchedCategory.level 
        };
    } else if (maxCorrect === 3) {
        result = { success: true, isCorrect: false, message: "One away..." };
    } else {
        result = { success: true, isCorrect: false, message: "Not even close!" };
    }

    // 5. Persistence: Record the attempt
    updateUserHistory(userID, guess, result.isCorrect, matchedCategory.group, matchedCategory.level);

    return result;
};


const updateUserHistory = (userID, guess, isCorrect, category, level) => {
    let sessionData = {};
    
    
    try {
        if (fs.existsSync(SESSION_FILE)) {
            const fileContent = fs.readFileSync(SESSION_FILE, 'utf8');
            if (fileContent.trim()) {
                sessionData = JSON.parse(fileContent);
            }
        }
    } catch (err) {
        sessionData = {};
    }

    // Initialize user if new
    if (!sessionData[userID]) {
        sessionData[userID] = { lives: 4, history: [], solved: [] };
    }

    const user = sessionData[userID];
    
    // Save the guess and timestamp
    user.history.push({ 
        guess: guess, 
        isCorrect:isCorrect,
        timestamp: new Date().toISOString() 
    });
    
    if(isCorrect){
        user.solved.push({
            category: category,
            category_words:guess,
            category_level:level
        })
    }
    user.lives--;
    
    

    // Write back to disk (human-readable format)
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));
};