import '../style.css';
import React from 'react';

export default function LifeCounter({ lives }) {
    console.log("Lives", lives);
    return (
        <div className='lifecounter'>
            <span className='mistakes-label'>Mistakes remaining:</span>
            <div className='dots-container'>
                {/* Create an array of length 'lives' and map a dot for each */}
                {Array(lives)?.fill(0).map((_, i) => (
                    <span key={i} className='dot'></span>
                ))}
            </div>
        </div>
    )
}