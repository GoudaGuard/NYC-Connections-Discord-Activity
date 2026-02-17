import React from "react";
import { motion } from "framer-motion";


export default function SubmitButton({isDisabled, onClick}) {
  
  

  return (
      <button
        className= {'control-button'}
        disabled={isDisabled}
        onClick={onClick}
        >
        {"Submit"}
      </button>
      
  )
}