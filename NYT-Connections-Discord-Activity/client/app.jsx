import React from "react";
import ReactDOM from "react-dom/client";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import "./style.css";
import {useState, useEffect} from "react";
import { shuffle } from "lodash";
import Grid from "./Components/Grid.jsx";



// --- DISCORD SETUP (Same as before) ---
let discordSdk;



if (window.location.search.includes('frame_id')) {
    discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
    discordSdk.ready().then(() => console.log("Discord SDK ready!"));
} else {
    console.log("Local Browser Mode: Skipping Discord SDK");
}




const handleSolve = (displayWords, selected_words) => {
  // 1. Create a shallow copy of your words array (Immutability!)
  let newGrid = [...displayWords];
  const targetIndices = [0, 1, 2, 3]; 

  selected_words.forEach((word, i) => {
    const currentIndex = newGrid.indexOf(word);
    const targetIndex = targetIndices[i];


    [newGrid[currentIndex], newGrid[targetIndex]] = [newGrid[targetIndex], newGrid[currentIndex]];
  });

  // 4. Update the state
  return newGrid;
};

async function getWords(){
  const response = await fetch('http://localhost:3001/api/game/getWords');
  const data = await response.json();
  return data;

}



// --- REACT COMPONENT (The Grid) ---
function ConnectionsGrid() {
  
 // const[notificationOn, setNotificationOn]= useState(visible=false, msg="");

  /*
  const triggerNotification=(msg)=>{
    setNotificationOn(visible=true, msg=msg);
    setTimeout(()=>{
      setNotificationOn(visible=false, m)
    },1000)
  }
    */
  
        //Example Word Bank
        
          //console.log("Master List Contents:" , masterList);
          //Shuffles List of Words Displayed
          const [displayWords, setDisplayWords] = useState([]);
        useEffect(() => {
              const loadGameData = async () => {
                const data = await getWords(); 
                
                // Check if 'data.words' exists specifically!
                if (data && data.success && Array.isArray(data.words)) {
                  setDisplayWords(data.words); 
                } else {
                  console.error("Data received but 'words' array missing:", data);
                }
              };
              loadGameData();
            }, []);
  
  
  return (
    <div>
    <Grid displayWords={displayWords} setDisplayWords={setDisplayWords} handleSolve={handleSolve} />
      
      </div>
    
  );
}



ReactDOM.createRoot(document.getElementById("app")).render(<ConnectionsGrid />);