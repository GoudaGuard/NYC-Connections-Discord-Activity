import express from "express";
import gameRoutes from './routes.js';
import cors from 'cors';
import { autoScrape } from "./scraper.js";
import { verifyKeyMiddleware } from 'discord-interactions';
import * as Controller from './controller.js';
import dotenv from "dotenv";

dotenv.config({ override: true });

const app = express();
app.use(cors());



// server.js (Port 3001)
// server.js
// This catches the request whether the proxy keeps or strips the /api prefix
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url}`);
  next();
});

app.post(
    ['/api/interactionVerify', '/interactionVerify'], 
    verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY), 
    Controller.interactionVerify
);


app.use(express.json());

app.use('/game', gameRoutes);

const port = 3001;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  // autoScrape();
});