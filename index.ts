import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { dbConnect } from './models/index.js';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import router from './routes/routes.js';
import middleware from './utils/middleware.js';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// const validateInput = [
//   body('email').isEmail().normalizeEmail(),
//   body('password').isLength({ min: 6 }),
// ];

// app.use(validateInput);

middleware(app);
router(app);

app.get('/', (req: Request, res: Response) => {
  res.send('home');
});

app.listen(PORT, () => {
  // had issues with exporting just the model folder so exported a function to connect to db instead
  dbConnect();
});
