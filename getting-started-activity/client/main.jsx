import React from "react";
import ReactDOM from "react-dom/client";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import "./style.css";
import {useRef, useState} from "react";
import { submitButton } from "./buttonBehavior";
//import React, {useState} from "react";
import { shuffle } from "lodash";
import WordButton from "./Components/WordButton.jsx";
import Grid from "./Components/Grid.jsx";



// --- DISCORD SETUP (Same as before) ---
let discordSdk;
let numberSelected=0;


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



// --- REACT COMPONENT (The Grid) ---
function ConnectionsGrid() {
  
  //Example Word Bank
  const yellow_words = ["APPLE", "BANANA", "CHERRY", "DATE"];
          const blue_words =[ "ELDER", "FIG", "GRAPE", "HONEY"];
          const green_words =["ICE", "JUICE", "KIWI", "LEMON"];
          const purple_words = ["MELON", "NUT", "OAK", "PEAR"];
          const masterList = [...yellow_words, ...blue_words, ...purple_words, ...green_words];
          console.log("Master List Contents:" , masterList);
          //Shuffles List of Words Displayed
          let [displayWords, setDisplayWords] = useState(() => shuffle(masterList));
          console.log("Display Words Contents:" , displayWords);

          if (displayWords.length === 0) {
            return <div>No words to display</div>;
        }
  
  

  return (
    <div>
    <Grid displayWords={displayWords} setDisplayWords={setDisplayWords} handleSolve={handleSolve} />
    
    
    
    
    
      </div>
  );
}



ReactDOM.createRoot(document.getElementById("app")).render(<ConnectionsGrid />);