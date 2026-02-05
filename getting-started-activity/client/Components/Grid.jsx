import React, { useState } from "react";
import { shuffle } from "lodash";
import WordButton from "./WordButton.jsx";
import "../style.css";

export default function Grid({ displayWords, setDisplayWords, handleSolve }) {
    console.log("Rendering Connections Grid");
    const [selectedWords, setSelectedWords] = useState([]);
    const [isWrong, setIsWrong] = useState(false);

    //Handles Button Selection
    const handleToggleWord = word =>{
        const isAlreadySelected = selectedWords.includes(word);
        if(isAlreadySelected){
        setSelectedWords(selectedWords.filter(w=>w!==word));
        }
        else if(selectedWords.length < 4){
        setSelectedWords([...selectedWords, word]);
        console.log("Updated Selected Words. Contents:" + selectedWords);
        }
    };

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



    //Shuffle Button OnClick Handler
    const handleShuffle = () => {
        // We create a NEW shuffled array and tell React to update the state
        const newShuffle = shuffle([...displayWords]); 
        setDisplayWords(newShuffle);
      };
    
    console.log("Rendering Grid Component");

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
            <button className="control-button" onClick={handleSubmit} disabled={selectedWords.length!==4}>Submit</button>
        </div>
    );
    }
}