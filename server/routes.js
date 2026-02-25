import express from 'express';
import * as Controller from './controller.js';
import {verifyKeyMiddleware} from 'discord-interactions';
import dotenv from "dotenv"
dotenv.config({ path: "./.env" });

const router = express.Router();

router.get('/getWords', Controller.getWords);
router.post('/checkGuess', Controller.checkGuess);
router.post('/loadProgress', Controller.loadProgress);
router.post('/token', Controller.getToken);
router.post('/finishGame',Controller.finishGame);
//router.post('/sendEmbed', Controller.sendEmbed);
router.post('/interactionVerify', verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY), Controller.interactionVerify);
export default router;