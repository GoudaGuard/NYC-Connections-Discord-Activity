import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import { shuffle } from "lodash";
import Grid from "./Components/Grid.jsx";
import "./style.css";


const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
let globalAccessToken = null;
let channelID = null;
let webhookURL=null;


const sleep = (ms)=> new Promise(resolve => setTimeout(resolve, ms));

function ConnectionsGrid() {
  const [isReady, setIsReady] = useState(false);
  const [displayWords, setDisplayWords] = useState([]);
  const [solvedCategories, setSolvedCategories] = useState([]);
  const [lives, setLives] = useState(4);
  const[notification, triggerNotification]= useState({visible:false, msg: " " });


  useEffect(() => {
    const setupDiscord = async () => {
      try {
        await discordSdk.ready();
        console.log("Discord SDK is ready");
        // Get the channel ID directly from the SDK environment
        channelID = discordSdk.channelId;


        const { code } = await discordSdk.commands.authorize({
          client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
          response_type: "code",
          state: "",
          prompt: "none",
          scope: ["identify", "guilds", "applications.commands", "webhook.incoming"],
          
        });

        const response = await fetch("/api/game/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();
        globalAccessToken = data.access_token;
        webhookURL = data.webhookURL;

        const auth = await discordSdk.commands.authenticate({
          access_token: globalAccessToken,
        });

        if (auth == null) {
          throw new Error("Authenticate command failed");
        }
        
        setIsReady(true);
        
    }
    catch (error) {
        console.error("Failed to setup Discord SDK:", error);
      }
    };

    setupDiscord();
  }, []);

  // 2. Load game data ONLY AFTER Discord is ready
  useEffect(() => {
    if (!isReady) return;

    const loadGameData = async () => {
      try {
        console.log("Loading Progress with access token: ", globalAccessToken);
        const response = await fetch('/api/game/loadProgress', {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=UTF-8" },
          body: JSON.stringify({ access_token: globalAccessToken, channelID:channelID }),
        });
        
        //WEBHOOK CHECK
        const data = await response.json();
        console.log("webhook url: ", webhookURL);
        const bluh = await fetch(webhookURL,{ 
          method:"POST",  
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "Cheese " })
      });
      console.log("test message sent");

        if (data && data.success && Array.isArray(data.words)) {
          setDisplayWords(data.words);
          setSolvedCategories(data.solved);
          setLives(data.lives);
          
          console.log("Initial embed sent to Discord!");
        } else {
          console.error("Data received but 'words' array missing:", data);
        }
      } catch (error) {
        console.error("Failed to load progress:", error);
      }
    };

    loadGameData();
  }, [isReady]);

 


  const handleSolve = (currentWords, selected_words) => {
    // 1. Create a shallow copy of the passed-in words
    let newGrid = [...currentWords];
    const targetIndices = [0, 1, 2, 3];

    selected_words.forEach((word, i) => {
      const currentIndex = newGrid.indexOf(word);
      const targetIndex = targetIndices[i];
      
      // Swap the correctly guessed words to the top 4 spots
      [newGrid[currentIndex], newGrid[targetIndex]] = [newGrid[targetIndex], newGrid[currentIndex]];
    });

    return newGrid;
  };

  const handleShuffle = async () => {
    setDisplayWords(shuffle([...displayWords]));
  };

  
  const finishGame= async () =>{
      const response = await fetch('/api/game/finishGame',{
          method: "POST",
          headers: { "Content-Type": "application/json; charset=UTF-8" },
          body: JSON.stringify({ access_token: globalAccessToken }),
      })
      const data= await response.json();
      console.log("Data for finished game : ", data);
      data.response.forEach((entry,index)=>{
        setDisplayWords(handleSolve(displayWords, entry.category_words));
        setTimeout(()=>{
          setSolvedCategories(prev=>[...prev, entry]);
          setDisplayWords(currenttGrid=>{
            return currenttGrid.filter(w=>!entry.category_words.includes(w));
          })
        },1000*(index+2))
        console.log("Solved Categories After Finishing Game: ", solvedCategories);
      })
  }
  useEffect(()=>{
      if(lives===0){
          setTimeout(()=>{
          triggerNotification({visible:true, msg:"Nice Try..."});
          sleep(500);
          triggerNotification({visible:true, msg:"loser"});
          sleep(500)
          triggerNotification({visible:false, msg:""});
          finishGame();
          }, 1500);
      }
  }, [lives]);





  if (!isReady) {
    return <div>Connecting to Discord...</div>;
  }

   
  



  return (
    <div>
      <Grid 
        displayWords={displayWords}
        setDisplayWords={setDisplayWords}
        solvedCategories={solvedCategories}
        setSolvedCategories={setSolvedCategories}
        lives={lives}
        setLives={setLives}
        handleSolve={handleSolve}
        handleShuffle={handleShuffle}
        access_token={globalAccessToken}
        notification={notification}
        triggerNotification={triggerNotification}
      />

    </div>
    
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<ConnectionsGrid />);