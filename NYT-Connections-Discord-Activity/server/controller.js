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
    const response =Services.checkGuess(req.body);
    res.status(200).json({success:true, ...response});
}