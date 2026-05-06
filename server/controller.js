import { access, rmSync } from 'fs';
import * as Services from './services.js';
import * as imageGen from './image_gen.js';
import dotenv from "dotenv";
dotenv.config({ path: "./.env", override: true });



export const getWords= (req, res)=>{
    try{
        console.log("getWords Endpoint Reached at Controller")
        const words=Services.getWords();
        res.status(200).json({success:true, words})
    }
    catch(error){
        console.error("Server CRASH:", error);
        res.status(500).json({success:false, message: error.message});
    }
}


    

export const checkGuess= async(req, res)=>{
    try{
    const response = await Services.checkGuess(req.body.words, req.body.access_token);
    res.status(200).json({success:true, ...response});
    }
    catch(error){
        console.error("Server CRASh:", error);
        res.status(500).json({success:false, message: error.message});
    }
}

export const loadProgress= async (req,res)=>{
    //console.log("loadProgress endpoint reached");
    try{
        const response= await Services.loadProgress(req.body.access_token, req.body.channelID);
        //console.log("Opening Response from Load Progress", response);
        res.status(200).json({success:true, ...response});
    }
    catch(error){
        console.error("Server CRASh:", error);
        res.status(500).json({success:false, message: error.message});
    }
}

export const getToken=async(req,res)=>{
    try{
        const access_token = await Services.getToken(req.body.code);
        console.log("Access token received:", access_token ? "present" : "missing");
        res.status(200).json({success:true, access_token});
    }
    catch(error){
        console.error("Server CRASh:", error);
        res.status(500).json({success:false, message: error.message});
    }
}

export const finishGame=async(req,res)=>{
    try{
        const response= await Services.finishGame(req.body.access_token);
        res.status(200).json({success:true, response});
    }
    catch(error){
        console.error("Server CRASh:", error);
        res.status(500).json({success:false, message: error.message});
    }
}
/*
export const sendEmbed = async (req, res) => {
    try {
        const { access_token, channelID } = req.body;
        if (!access_token || !channelID) throw new Error("Missing parameters");
        
        await imageGen.processGridUpdate(access_token, channelID);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
*/
export const interactionVerify = async(req, res) => {
    
    const interaction = req.body;
    

    console.log(`INTERACTION TYPE: ${interaction.type}`);

    if (interaction.type === 1) {
        console.log(" Handshake PING successful");
        return res.send({ type: 1 });
    }

    if (interaction.type === 2 || interaction.type === 3) {
        const token = interaction.token;
        const application_ID = interaction.application_id;
        const channel_ID =  interaction.channel_id;
        const user_ID = interaction.member?.user?.id || interaction.user?.id;
        //console.log("📥 FULL INTERACTION:", JSON.stringify(interaction, null, 2));
        console.log("Token: ", token);
        console.log("appID: ", application_ID);
        console.log("chanID: ", channel_ID);
        console.log("userID: ", user_ID);

        res.send({
            type: 12,
            data: { flags: 0 }
        });

        try{
            console.log("Attempting to call function to process Grid image");
            await imageGen.processGridUpdate(token, user_ID);
        }
        catch(error){
            console.log("Couldn't load image: ", error);
        }
 
        /*
         try {
            const userID = interaction.member?.user?.id || interaction.user?.id;
            await imageGen.processGridUpdate(interaction.channel_id, interaction.token, null, userID);
        } catch (error) {
            console.error("Image Gen Error:", error);
        }
            */
    }
};