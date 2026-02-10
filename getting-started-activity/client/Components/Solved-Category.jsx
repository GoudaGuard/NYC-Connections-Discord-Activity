import React from 'react';
import '../style.css';


 const colormap={
    yellow: "#f9df6d",
    blue: "#b0c4ef",
    green: "#a0c35a",
    purple: "#ba81c5"
 };
export default function SolvedCategory({category, color, words}) {
    console.log(typeof Category);
    console.log(category);
    console.log(typeof color);
    console.log(typeof words);
    console.log("This category is", color);
    return(
        <div  className='solved-categories' 
        style={
            {backgroundColor: colormap[color]}
        }>
            <div>
                <h2 className='solved-categories-title'>{category} </h2>
                <div>
                
                <h3 className='solved-categories-words'>{words.join(", ")}</h3>
               
                </div>
            </div>
            
        </div>
    );
}
