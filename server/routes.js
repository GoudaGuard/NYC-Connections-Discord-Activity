import express from 'express';
import * as Controller from './controller.js';

const router = express.Router();

router.get('/getWords', Controller.getWords);
router.post('/checkGuess', Controller.checkGuess);
router.post('/loadProgress', Controller.loadProgress);
router.post('/token', Controller.getToken);
router.post('/finishGame',Controller.finishGame);
export default router;