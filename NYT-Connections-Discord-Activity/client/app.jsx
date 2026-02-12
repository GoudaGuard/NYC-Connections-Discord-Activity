import React from "react";
import ReactDOM from "react-dom/client";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import "./style.css";
import {useState, useMemo} from "react";
import { shuffle } from "lodash";
import Grid from "./Components/Grid.jsx";



// --- DISCORD SETUP (Same as before) ---
let discordSdk;



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
  const[notificationOn, setNotificationOn]= useState(visible=false, msg="");


  const triggerNotification=(msg)=>{
    setNotificationOn(visible=true, msg=msg);
    setTimeout(()=>{
      setNotificationOn(visible=false, m)
    },1000)
  }
  
  //Example Word Bank
  const yellow_words = ["APPLE", "BANANA", "CHERRY", "DATE"];
          const blue_words =[ "ELDER", "FIG", "GRAPE", "HONEY"];
          const green_words =["ICE", "JUICE", "KIWI", "LEMON"];
          const purple_words = ["MELON", "NUT", "OAK", "PEAR"];
          const masterList = [...yellow_words, ...blue_words, ...purple_words, ...green_words];
          //console.log("Master List Contents:" , masterList);
          //Shuffles List of Words Displayed
          const [displayWords, setDisplayWords] = useState([]);
          useMemo(() => {
            setDisplayWords(shuffle(masterList));
          }, []); 
          console.log("Display Words Contents:" , displayWords);

          
  

  return (
    <div>
    <Grid displayWords={displayWords} setDisplayWords={setDisplayWords} handleSolve={handleSolve} />
      <Notification word={notificationOn.visible && notificationOn.Msg}></Notification>
      </div>
    
  );
}



ReactDOM.createRoot(document.getElementById("app")).render(<ConnectionsGrid />);