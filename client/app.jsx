import React from "react";
import ReactDOM from "react-dom/client";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import "./style.css";
import {useState, useEffect, useMemo} from "react";
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

async function loadProgress(){
  const response = await fetch('/api/game/loadProgress');
  const data = await response.json();
  return data;
}
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


// --- REACT COMPONENT (The Grid) ---
  function ConnectionsGrid() {
    const [displayWords, setDisplayWords] = useState([]);
    const [solvedCategories, setSolvedCategories]=useState([])
    const[lives, setLives] = useState(4);

    const handleShuffle = () => {
        //console.log(`Hooks: isProcessing:${isProcessing}, isSubmitting:${isSubmitting}, isWrong: ${isWrong}` );
        setDisplayWords(shuffle([...displayWords]));
    };

    //const [solvedCategories, setSolvedCategories] = useState([]);
        useEffect(() => {
              const loadGameData = async () => {
                const data = await loadProgress(); 
                if (data && data.success && Array.isArray(data.words)) {
                  setDisplayWords(data.words); 
                  setSolvedCategories(data.solved);
                  setLives(data.lives);
                } else {
                  console.error("Data received but 'words' array missing:", data);
                }
              };
              loadGameData();
            }, []);
            console.log(displayWords);
  
  return (
    <div>
    <Grid displayWords={displayWords} 
          setDisplayWords={setDisplayWords} 
          solvedCategories={solvedCategories}
          setSolvedCategories={setSolvedCategories} 
          lives={lives}
          setLives={setLives}
          handleSolve={handleSolve} 
          handleShuffle={handleShuffle}/>
      
      </div>
    
  );
}



ReactDOM.createRoot(document.getElementById("app")).render(<ConnectionsGrid />);