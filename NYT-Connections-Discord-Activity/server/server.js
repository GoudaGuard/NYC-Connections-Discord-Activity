import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config({ path: "../.env" });

const express = express();
const port = 3001;
const router = express.Router();
const controller=require('controller.js')

router.get('/api/getWords', controller.getWord);
router.post('/api/checkGuess', controller.checkGuess);
 
express.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = router;