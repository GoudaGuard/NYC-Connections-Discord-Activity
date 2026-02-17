
import '../style.css';
import React from 'react';

export default function Notification({msg}){
    console.log(typeof msg);
    return(
        
        <div className='notification'>
            
            <h2>{msg}</h2>
            </div>
            )
    
}