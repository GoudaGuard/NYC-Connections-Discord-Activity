import React, { useState, useRef, } from "react";
import { set, shuffle, words } from "lodash";

import WordButton from "./WordButton.jsx";
import SubmitButton from "./SubmitButton.jsx";
import SolvedCategory from "./Solved-Category.jsx";
import "../style.css";


export default function Grid({ displayWords, setDisplayWords, handleSolve }) {
  
    console.log("Rendering Connections Grid");
    
    //Hooks
    const [selectedWords, setSelectedWords] = useState([]);
    const [isWrong, setIsWrong] = useState(false);
    const[solvedCategories, setSolvedCategories]=useState([]);
    const[isProcessing, setIsProcessing]=useState(false);
    const[isExiting, setIsExiting]=useState(false);
    const isSumbitting=useRef(false);
  


    //console.log("Solved Categories after submit:" , solvedCategories.length);

    //Handles Button Selection
    const handleToggleWord = word =>{
        const isAlreadySelected = selectedWords.includes(word);
        if(isAlreadySelected){
        setSelectedWords(selectedWords.filter(w=>w!==word));
        }
        else if(selectedWords.length < 4){
        setSelectedWords([...selectedWords, word]);
        //console.log("Updated Selected Words. Contents:" + selectedWords);
        }
    };

  //Submit Button Handler
  //console.log("Set Selected Words before submit:" , selectedWords);
  //console.log("Display Words before submit:" , displayWords);
  const handleSubmit = () => {
    //Check if Submit Button has already been pressed
    if(isSumbitting.current) return; 
    setIsProcessing(true);
    isSumbitting.current = true;
    
    const setIsCorrect=false; 
    if(setIsCorrect){
      
      const newGrid = handleSolve(displayWords, selectedWords);
      setDisplayWords(newGrid);
      //console.log("Display Words after swap" , displayWords);
      
      const category="Test Category"; // Placeholder
      const color="yellow"; // Placeholder
      setTimeout(() => {
        
      const newSolved = { category_label: "Category Name", color: "yellow", words: selectedWords };
      setSolvedCategories(prev => [...prev, newSolved]);
      //console.log("Display Words after category is placed" , displayWords);
      
      // Calculate what is left AFTER removing the 4 words
      const remainingWords = newGrid.filter(w => !selectedWords.includes(w));
      setDisplayWords(remainingWords);
      setSelectedWords([]);

         if(remainingWords.length==4){
            handleAutoSolveLastCategory(remainingWords);
        }
        setIsProcessing(false);
        isSumbitting.current = false;
  
      }, 1000);
  }
    else{
      setIsProcessing(false);
      setIsWrong(true);
      setTimeout(() => {  
      
      setTimeout(() => {
        setIsWrong(false);
        setIsProcessing(false);
         isSumbitting.current = false;
      }, 500); // 500ms matches your animation duration
    },1000);
  };
  
}

//Helper function for last animation
const handleAutoSolveLastCategory = (finalWords) => {
  setTimeout(() => {
    const lastSolved = { 
      category_label: "Final Category", 
      color: "purple", 
      words: finalWords 
    };
    setSolvedCategories(prev => [...prev, lastSolved]);
     setDisplayWords([]);
  }, 1500); // Slight extra delay for dramatic effect
};




  //console.log("Display Words after submit:" , displayWords);



    //Shuffle Button OnClick Handler
    const handleShuffle = () => {
        // We create a NEW shuffled array and tell React to update the state
        const newShuffle = shuffle([...displayWords]); 
        setDisplayWords(newShuffle);
      };
    
    console.log("Rendering Grid Component");
    console.log(solvedCategories)




    return (
        <div className="game-container">
            <h1>Connections</h1>
            <div className="grid">
                    {solvedCategories.map((category) => (
                        <SolvedCategory 
                            key={category} 
                            category={category.category_label} 
                            color={category.color} // Placeholder for actual color
                            words={category.words}
                        />
                    ))}
                

                {displayWords.map((word, index) => (
                <WordButton 
                    key={word} 
                    word={word} 
                    isSelected={selectedWords.includes(word)}
                    onSelectionChange={() => handleToggleWord(word)}
                    isShaking={isWrong && selectedWords.includes(word)}
                    isDisabled={selectedWords.length === 4 && !selectedWords.includes(word)}
                    isProcessing={isProcessing && selectedWords.includes(word) }
                    isExiting={isExiting && selectedWords.includes(word)}
                />
                ))}
            </div>
            <button className="control-button" onClick={handleShuffle}>Shuffle</button>
            <SubmitButton isDisabled={selectedWords.length!==4 || isProcessing || isWrong} onClick={handleSubmit} ></SubmitButton>
        </div>
    );
    }
