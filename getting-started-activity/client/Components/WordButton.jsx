import React from "react";
import { motion } from "framer-motion";
import { delay, repeat } from "lodash";

const buttonState = {
    idle:{
      x:0,
      y:0,
      scale:1
    },

    processing: {
      y: [0, -10, 0],
      transition: (key) => ({
        delay: key * 0.1,
        repeat: Infinity,
        duration:0.6,
        ease: "easeInOut"
      }),


    wrong_shaking: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 1, ease: "easeInOut" }
    },
    exiting:{
      opacity:[100,80,60],
      transition:{duration:1, ease:"easeInOut"}
    }
  }
};


export default function WordButton({word, isSelected, onSelectionChange, isShaking, isDisabled, isProcessing, isExiting}) {
    let currentState= "idle";
    
    if(isProcessing){
      currentState="processing"
    }
    else if(isShaking){
      currentState="wrong_shaking"
    }
    else if(isExiting){
      currentState="exiting"
    }

  return (
      <motion.button
      layout 
      // Adding a transition makes the "fly-to-top" look smooth
      transition={{ 
        type: "spring", 
        stiffness: 250, 
        damping: 70
      }}
        onClick={onSelectionChange}  
        className= { isSelected ? "word-button selected" : "word-button"}
        //word={word}
        disabled={isDisabled}
        variants={buttonState}
        animate={currentState}
        >
        {word}
      </motion.button>
      
  )
}