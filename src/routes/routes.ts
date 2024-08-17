import { Express } from 'express';
import authRouter from './authRoutes.js';
import userRouter from './userRoutes.js';
import testRouter from './testRoutes.js';
import passwordRouter from './passwordRoute.js';
import progressRouter from './progressRoutes.js';
import leaderboardRouter from './leaderboardRoutes.js';
import lessonRouter from './lessonRoutes.js';

const router = (app: Express) => {
  app.use('/auth', authRouter);
  app.use('/users', userRouter);
  app.use('/tests', testRouter);
  app.use('/password', passwordRouter);
  app.use('/progress', progressRouter);
  app.use('/leaderboard', leaderboardRouter);
  app.use('/lessons', lessonRouter);
};

export default router;
