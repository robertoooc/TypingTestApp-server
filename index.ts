import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { dbConnect } from './models/index.js';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import router from './routes/routes.js';
import middleware from './utils/middleware.js';

dotenv.config();


declare var process: {
  env: {
    JWT_SECRET: string;
    PORT: number;
    REMOTE: string;
  };
};

const PORT = process.env.PORT || 8000;
const app: Express = express();
app.use(express.json());

app.use(cors({ credentials: true, origin: process.env.REMOTE }));
app.options(process.env.REMOTE, cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');
  app.use(mongoSanitize()); // removes $ and . to avoid noSQL injections
  next();
});

middleware(app);
router(app);

app.get('/', (req: Request, res: Response) => {
  res.send('home');
});

app.listen(PORT, () => {
  // had issues with exporting just the model folder so exported a function to connect to db instead
  dbConnect();
});
