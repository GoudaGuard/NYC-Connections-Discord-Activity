import { rmSync } from 'fs';
import * as Services from './services.js';
import * as imageGen from './image_gen.js';


export const getWords= (req, res)=>{
    try{
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
        const response= await Services.loadProgress(req.body.access_token);
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
        const response= await Services.getToken(req.body.code);
        res.status(200).json({success:true, access_token:response});
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
export const interactionVerify = async(req, res) =>{
    const interaction = req.body;

    if(interaction.type ===1){
        res.send({type:1});
    }

    if(interaction.type === 2){
        const {channel_ID, token} = interaction;
        res.send({type:5});
        await imageGen.processGridUpdate(channel_ID, token);
    }
}