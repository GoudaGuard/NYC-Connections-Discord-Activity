import gameData from './connections.json' with {type:'json'};

console.log("Connections being read");

const mulberry32 = (a) => {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
};

export const getWords= ()=>{
    const latestPuzzle=gameData[0];
    return latestPuzzle.answers.flatMap(category => category.members);

}

export const checkGuess= (guess) =>{
    return 0;
}

