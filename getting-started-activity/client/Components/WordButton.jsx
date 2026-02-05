import React from "react";
import { motion } from "framer-motion";

export default function WordButton({word, isSelected, onSelectionChange, isShaking, isDisabled}) {
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