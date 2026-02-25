import fs from 'fs';

const SESSION_FILE = "../userSessions.json";

export function clearTodayPuzzle(userID){
    const date = new Date();
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    let sessionData = {}
    if (fs.existsSync(SESSION_FILE)) {
            sessionData = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8') || '{}');
        }
    
    if (!sessionData[userID]) {
        console.error(`User ${userID} not found in session data.`);
        return; 
    }


    if (sessionData[userID].length === 0) {
        console.error(`User ${userID} has an empty session array.`);
        return;
    }


    sessionData[userID][sessionData[userID].length - 1] = {
        date: dateString,
        gameProgressforDate: { lives: 4, history: [], solved: [] }
    };
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 2));
    
    console.log(`Successfully reset the latest puzzle for ${userID}`);

}

clearTodayPuzzle("624022634337927168");