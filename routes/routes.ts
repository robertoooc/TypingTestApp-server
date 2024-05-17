import { Express } from 'express';
import authRouter from './authRoutes.js';
import userRouter from './userRoutes.js';
import testRouter from './testRoutes.js';
import passwordRouter from './passwordRoute.js';

const router = (app: Express) => {
  app.use('/auth', authRouter);
  app.use('/users', userRouter);
  app.use('/tests', testRouter);
  app.use('/password', passwordRouter);
};

export default router;
