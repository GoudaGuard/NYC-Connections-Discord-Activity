import express from "express";
import 'dotenv/config';
import gameRoutes from './routes.js';
//dotenv.config({ path: "../.env" });
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/game', gameRoutes)

const port = 3001;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

