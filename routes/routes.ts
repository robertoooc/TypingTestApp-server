import { Express } from 'express';
import authRouter from './authRoutes.js';
import userRouter from './userRoutes.js';
import testRouter from './testRoutes.js';

const router = (app: Express) => {
  app.use('/auth', authRouter);
  app.use('/users', userRouter);
  app.use('/tests', testRouter);
};

export default router;
