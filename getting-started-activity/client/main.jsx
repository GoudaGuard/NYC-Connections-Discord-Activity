import React from "react";
import ReactDOM from "react-dom/client";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import "./style.css";
import {useState} from "react";
import { submitButton } from "./buttonBehavior";
//import React, {useState} from "react";
import { shuffle } from "lodash";
import { motion } from "framer-motion";

// --- DISCORD SETUP (Same as before) ---
let discordSdk;
let numberSelected=0;


if (window.location.search.includes('frame_id')) {
    discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
    discordSdk.ready().then(() => console.log("Discord SDK ready!"));
} else {
    console.log("Local Browser Mode: Skipping Discord SDK");
}


const WordButton = ({word, isSelected, onSelectionChange, isShaking, isDisabled}) =>{
  const shakeAnimation = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5, ease: "easeInOut" }
  };

  return (
      <motion.button
      layout 
      // Adding a transition makes the "fly-to-top" look smooth
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }}
        onClick={onSelectionChange}  
        className= { isSelected ? "word-button selected" : "word-button"}
        word={word}
        disabled={isDisabled}
        animate={isShaking ? shakeAnimation : { x: 0 }}
        >
        {word}
      </motion.button>
      
  )
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
  console.log("Rendering Connections Grid");
  const yellow_words = ["APPLE", "BANANA", "CHERRY", "DATE"];
  const blue_words =[ "ELDER", "FIG", "GRAPE", "HONEY"];
  const green_words =["ICE", "JUICE", "KIWI", "LEMON"];
  const purple_words = ["MELON", "NUT", "OAK", "PEAR"];
  const masterList = [...yellow_words, ...blue_words, ...purple_words, ...green_words];
  console.log("Master List Contents:" , masterList);
  //Shuffles List of Words Displayed
  let [displayWords, setDisplayWords] = useState(() => shuffle(masterList));
  console.log("Display Words Contents:" , displayWords);

  //Handles Shuffle Button
  const handleShuffle = () => {
    // We create a NEW shuffled array and tell React to update the state
    const newShuffle = shuffle([...displayWords]); 
    setDisplayWords(newShuffle);
  };
  
  //Handles Button Selection
  const [selectedWords, setSelectedWords] = useState([]);
  const [isWrong, setIsWrong] = useState(false);

  console.log("Updated Selected Words. Contents:" + selectedWords);
  const handleToggleWord = word =>{
    const isAlreadySelected = selectedWords.includes(word);
    if(isAlreadySelected){
      setSelectedWords(selectedWords.filter(w=>w!==word));
    }
    else if(selectedWords.length < 4){
      setSelectedWords([...selectedWords, word]);
      console.log("Updated Selected Words. Contents:" + selectedWords);
    }
    
  }
  //Submit Button Handler
  console.log("Set Selected Words before submit:" , selectedWords);
  //console.log("Display Words before submit:" , displayWords);
  const handleSubmit = () => {
    const setIsCorrect=true; // Placeholder for actual correctness check
    if(setIsCorrect){
      console.log("Set is Correct, moving to nearest row.")
        
              
      const newGrid = handleSolve(displayWords, selectedWords);
      setDisplayWords(newGrid);
      setSelectedWords([]);
  }
    else{
      
      setIsWrong(true);
      setTimeout(() => {
        setIsWrong(false);
      }, 500); // 500ms matches your animation duration
  };
  console.log("Display Words after submit:" , displayWords);
}
  return (
    <div className="game-container">
      <h1>Connections</h1>
 
      <div className="grid">
        {displayWords.map((word, index) => (
          <WordButton 
          
            key={word} 
            word={word} 
            isSelected={selectedWords.includes(word)}
            onSelectionChange={() => handleToggleWord(word)}
            isShaking={isWrong && selectedWords.includes(word)}
            isDisabled={selectedWords.length === 4 && !selectedWords.includes(word)}
          />
          
        ))}
      </div>
      <button className="control-button" onClick={handleShuffle}>Shuffle</button>
      //<button className="control-button" onClick={handleSubmit} disabled={selectedWords.length!=4} >Submit</button>
      </div>
  );
}



ReactDOM.createRoot(document.getElementById("app")).render(<ConnectionsGrid />);