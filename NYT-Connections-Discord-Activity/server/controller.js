
const userServices= require('services.js');

exports.getWords= async=> {
    try{
        const res= await(services.getWords());
        if(!res){
        throw("Words not found")
         }
    }
    
    catch(err){
        console.error(err)
    }
    res.json();
}