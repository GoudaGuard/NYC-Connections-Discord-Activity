import fs from "fs";
import gameData from './connections.json' with { type: 'json' };
import userHistory from './userSessions.json' with {type:'json'};
import { proxyEventsPlugin } from "http-proxy-middleware";
const SESSION_FILE = './userSessions.json';

//Load Words
export const getWords = () => {
    try {
        const latestPuzzle = gameData[0];
        
        return latestPuzzle.answers.flatMap(category => category.members);
    } catch (err) {
        console.error("Error reading gameData:", err);
        return [];
    }
}

export const loadProgress=()=>{
    console.log("loadProgress endpoint reached");
    const userID="1";
    
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
        //console.log("Session Data:", sessionData);
        const userDataEntryObject = sessionData[userID] || { lives: 4, history: [], solved: [] };
        /*
    try{
        
    }
    catch(err){
        console.log("User not found or has no history for today")
        return getWords();
    }
        */
    let solved_categories={}
     solved_categories.solved= userDataEntryObject.history.filter(entry => entry.isCorrect === true).map(entry=>{
        
           // console.log("category", entry.category, "category_level",entry.level, "category_words",entry.guess)
            return {category:entry.category, category_level:entry.level, category_words:entry.guess};
            
        })
    
        //console.log("contents of solved_categories[0]",solved_categories.solved[0]);
    //console.log("Opening Response from Load Progress Part 1", solved_categories.solved);

        
        //solved_categories.words=[...solved_categories, gameData[0].filter((word=>{!solved_categories.some(word)}))]
        //console.log("Opening Response from Load Progress", solved_categories);
        const word_bank=getWords();
        let words_already_solved=[];
        try{
        words_already_solved= solved_categories.solved.flatMap(
            category=>category.category_words)
        }
        catch(error){
            console.log("Only One Entry");
            words_already_solved=solved_categories.solved[0].category_words;
        }
        
        const word_bank_filt=word_bank.filter(word=>!words_already_solved.includes(word));
        console.log()
        console.log("WordBank",word_bank, typeof word_bank);
        console.log("words alr solved", words_already_solved, typeof words_already_solved);
        console.log("WordBankFilt",word_bank_filt, typeof word_bank_filt);
        
        solved_categories.words=word_bank.flat().filter(word=>!words_already_solved.flat().includes(word));
        
        console.log("Solved cat ", solved_categories);

        solved_categories.lives=userDataEntryObject.lives;
        return solved_categories;
}


/**
 * Main logic for checking a user's guess.
 */
export const checkGuess = (guess, userId) => {
    // Hardcoded for testing; replace with actual Discord User ID later
    userId = "1"; 
    const latestPuzzle = gameData[0]; 
    
    // 1. SAFELY Load session data (The Anti-Crash layer)
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

    // 2. Already Guessed Logic
    const userSession = sessionData[userId];
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
    updateUserHistory(userId, guess, result.isCorrect, matchedCategory.group, matchedCategory.level);

    return result;
};


const updateUserHistory = (userId, guess, isCorrect, category, level) => {
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
    if (!sessionData[userId]) {
        sessionData[userId] = { lives: 4, history: [], solved: [] };
    }

    const user = sessionData[userId];
    
    // Save the guess and timestamp
    user.history.push({ 
        guess: guess, 
        isCorrect:isCorrect,
        category:category,
        level:level,
        timestamp: new Date().toISOString() 
    });
    
    user.lives--;
    
    

    // Write back to disk (human-readable format)
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));
};