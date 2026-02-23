import React, { useState, useRef, useEffect } from "react";
import { shuffle } from "lodash";
import WordButton from "./WordButton.jsx";
import SubmitButton from "./SubmitButton.jsx";
import SolvedCategory from "./Solved-Category.jsx";
import Notification from "./Notification.jsx";
import LifeCounter from "./Life-Counter.jsx";
import "../style.css";
import { AnimatePresence } from "framer-motion";


export default function Grid({ displayWords, 
                                setDisplayWords, 
                                solvedCategories, 
                                setSolvedCategories, 
                                lives, 
                                setLives, 
                                handleSolve, 
                                handleShuffle, 
                                access_token}) {
                                    
    const [selectedWords, setSelectedWords] = useState([]);
    const [isWrong, setIsWrong] = useState(false);
    //const [solvedCategories, setSolvedCategories] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const isSubmitting = useRef(false);
    const[notification, triggerNotification]= useState({visible:false, msg: " " });
    

    const handleToggleWord = (word) => {
        const isAlreadySelected = selectedWords.includes(word);
        if (isAlreadySelected) {
            setSelectedWords(selectedWords.filter(w => w !== word));
        } else if (selectedWords.length < 4) {
            setSelectedWords([...selectedWords, word]);
        }
    };

    const checkWords = async (wordStrings) => {
        const response = await fetch('/api/game/checkGuess', {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify({ words: wordStrings, access_token: access_token }),
        });
        return await response.json();
    };
    
    const handleAutoSolveLastCategory = async (finalWords) => {
        await sleep(1000);
         const data=await checkWords(displayWords.sort((a, b) => a.localeCompare(b)));
         const newSolved = {
                        category: data.group,
                        category_level: data.level,
                        category_words: finalWords
                    };
        setSolvedCategories(prev => [...prev, newSolved]);

        setDisplayWords([]);
    };
    useEffect(() => {
    // Only auto-solve if they have 3 categories AND haven't lost the game
    if (solvedCategories?.length === 3 && lives > 0) {
       handleAutoSolveLastCategory(displayWords);
    }
    }, [solvedCategories?.length, lives]);


    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleSubmit = async () => {
        //Spam Blocker
        if (isSubmitting.current || selectedWords.length !== 4) return;
        setIsProcessing(true);
        isSubmitting.current = true;

        const wordstoCheck = [...selectedWords].sort((a, b) => a.localeCompare(b));

        try {
            const data = await checkWords(wordstoCheck);
            await sleep(1000);
            setIsProcessing(false);
            await sleep(500);
            
            const categoryName = data.group || data.category;
            if(categoryName){
                setDisplayWords(handleSolve(displayWords,wordstoCheck));
                setTimeout(() => {
                    const newSolved = {
                        category: data.group,
                        category_level: data.level,
                        category_words: wordstoCheck
                    };
                    
                    setSolvedCategories(prev => [...prev, newSolved]);

                    setDisplayWords(currentGrid => {
                        const remaining = currentGrid.filter(w => !wordstoCheck.includes(w));
                        
                        
                        
                        return remaining;
                    });

                    setSelectedWords([]);
                    
                    isSubmitting.current = false;
                }, 1000);
            }
        
            else {
                //setIsProcessing(false);
                setIsWrong(true);
                setIsProcessing(false);
                setLives(prev =>prev-1);
                console.log(typeof data.message);
                triggerNotification({visible:true, msg:data.message});
                setTimeout(() => {
                    setIsWrong(false);
                    triggerNotification({visible:false, msg:""});
                    isSubmitting.current = false;
                }, 1000);
            }
        } catch (err) {
            console.error("Connection error:", err);
            setIsProcessing(false);
            isSubmitting.current = false;
        }
    };

    console.log("Solved categories after" ,solvedCategories);
    return (
        <div className="game-container">
            <h1>Connections</h1>
            {notification.visible && <Notification msg={notification.msg}></Notification>}
            <div className="grid">
                <AnimatePresence>
                
                {solvedCategories?.map((category, index) => (
                    <SolvedCategory
                        key={`solved-${index}`} 
                        category={category}
                        level={category.category_level}
                        words={category.category_words}
                    />
                ))}

                {/* Pure string mapping with index-based keys */}
                {displayWords.map((word, index) => (
                    
                    <WordButton
                        key={`word-${word}`} 
                        word={word} 
                        isSelected={selectedWords.includes(word)}
                        onSelectionChange={() => handleToggleWord(word)}
                        isShaking={isWrong && selectedWords.includes(word)}
                        isDisabled={selectedWords.length === 4 && !selectedWords.includes(word)}
                        isProcessing={isProcessing && selectedWords.includes(word)}
                        isExiting={isExiting}
                    />
                    
                ))}
                </AnimatePresence>
            </div>
            <div><LifeCounter lives={lives}></LifeCounter></div>
            <div className="controls">
                <button className="control-button" onClick={handleShuffle}>Shuffle</button>
                <SubmitButton 
                    isDisabled={selectedWords.length !== 4 || isProcessing} 
                    onClick={handleSubmit} 
                />
            </div>
        </div>
    );
}