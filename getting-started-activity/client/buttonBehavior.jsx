import {motion} from "framer-motion";
import {useState} from "react";


const shake_Animation={
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 },
    };



export function ShakeButton(selected_words) {
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = () => {
    setIsShaking(true);
    // Stop shaking after animation duration
    setTimeout(() => setIsShaking(false), 500);
  };
}

export function submitButton(selected_words) {
  ShakeButton(selected_words);
  console.log("Submit Button Clicked with words: " + selected_words);
}
