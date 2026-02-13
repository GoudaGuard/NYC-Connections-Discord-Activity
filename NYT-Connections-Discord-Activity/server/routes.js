import express from 'express';
import * as Controller from './controller.js';

const router = express.Router();

router.get('/getWords', Controller.getWords);
router.post('/checkGuess', Controller.checkGuess);

export default router;