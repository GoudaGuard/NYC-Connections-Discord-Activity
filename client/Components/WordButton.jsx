import React from "react";
import { motion } from "framer-motion";

const buttonState = {
  idle: {
    x: 0,
    y: 0,
    scale: 1,
    transition:{ type: "spring", stiffness: 250, damping: 70 }
  },
  processing: {
    y: [0, -10, 0],
    transition: {
      repeat: Infinity,
      duration: 0.6,
      ease: "easeInOut"
    }
  },
  wrong_shaking: {
    
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4, ease: "easeInOut" }
  },
  exiting: {
    
    opacity: 0,
    scale: 0.5,
    transition: { duration: 0.3 }
  }
};

export default function WordButton({
  word, 
  isSelected, 
  onSelectionChange, 
  isShaking, 
  isDisabled, 
  isProcessing, 
  isExiting,
  
}) {
  let currentState = "idle";
  if (isProcessing) {
    currentState = "processing";
  }
  else if (isShaking) {
    currentState = "wrong_shaking";
  } else if (isExiting) {
    currentState = "exiting";
  } else if (isSelected) {
    currentState = "idle"; 
  }
   

  return (
      <motion.button
        layout
        
        onClick={onSelectionChange}  
        className={`word-button ${isSelected ? "selected" : ""}`}
        disabled={isDisabled}
        variants={buttonState}
        animate={currentState}
        
        transition={{ 
          layout: { type: "spring", stiffness: 250, damping: 70 } 
        }}
      >
        {word}
      </motion.button>
  );
}