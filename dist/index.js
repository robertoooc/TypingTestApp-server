import express from 'express';
import dotenv from 'dotenv';
import { dbConnect } from './models/index.js';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import router from './routes/routes.js';
import middleware from './utils/middleware.js';
import rateLimit from 'express-rate-limit';
dotenv.config();
const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());
app.use(cors({ credentials: true, origin: process.env.REMOTE }));
app.options(process.env.REMOTE, cors());
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    app.use(mongoSanitize()); // removes $ and . to avoid noSQL injections
    next();
});
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
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
app.get('/', (req, res) => {
    res.send('home');
});
app.listen(PORT, () => {
    // had issues with exporting just the model folder so exported a function to connect to db instead
    dbConnect();
});
