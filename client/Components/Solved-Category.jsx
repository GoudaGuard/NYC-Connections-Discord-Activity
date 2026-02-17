import React from 'react';
import '../style.css';
import { motion } from "framer-motion";

const colormap = {
    0: "#f9df6d", // Yellow
    1: "#a0c35a", // Green
    2: "#b0c4ef", // Blue
    3: "#ba81c5"  // Purple
};

export default function SolvedCategory({ category, level, words }) {
    return (
        <motion.div 
            className='solved-categories' 
            style={{ backgroundColor: colormap[level] || colormap[0] }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
            <h2 className='solved-categories-title'>{category.category}</h2>
            <h3 className='solved-categories-words'>
                {Array.isArray(words) ? words.join(", ") : words}
            </h3>
        </motion.div>
    );
}