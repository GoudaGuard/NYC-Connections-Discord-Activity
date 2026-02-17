import { rmSync } from 'fs';
import * as Services from './services.js';



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

export const checkGuess=(req, res)=>{
    try{
    const response =Services.checkGuess(req.body.words);
    res.status(200).json({success:true, ...response});
    }
    catch(error){
        console.error("Server CRASh:", error);
        res.status(500).json({success:false, message: error.message});
    }
}

export const loadProgress=(req,res)=>{
    //console.log("loadProgress endpoint reached");
    try{
        const response=Services.loadProgress();
        //console.log("Opening Response from Load Progress", response);
        res.status(200).json({success:true, ...response});
    }
    catch(error){
        console.error("Server CRASh:", error);
        res.status(500).json({success:false, message: error.message});
    }
}