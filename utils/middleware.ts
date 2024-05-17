import { Request, Response, NextFunction, Express } from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { dbConnect } from '../models/index.js';
dbConnect();
declare var process: {
  env: {
    JWT_SECRET: string;
  };
};

const middleware = (app: Express) => {
  app.all('*', async (req: Request, res: Response, next: NextFunction) => {
    if (
      req.originalUrl === '/auth/login' ||
      req.originalUrl === '/auth/register' ||
      req.originalUrl === '/auth/google' ||
      req.originalUrl === '/password/reset' ||
      req.originalUrl === '/password/forgotpassword' ||
      req.originalUrl === '/tests/all'
    ) {
      next();
      return;
    }
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) throw new Error('JWT token is missing');

      interface JWTPayload {
        name: string;
        email: string;
        id: string;
        iat: number;
      }
      const decode = jwt.verify(
        authHeader,
        process.env.JWT_SECRET
      ) as JWTPayload;
      const foundUser = await User.findOne({ _id: decode.id });

      res.locals.user = foundUser;

      next();
    } catch (err) {
      res.locals.user = null;
      res.status(401).json({ message: 'Not authorized' });
    }
  });
};

export default middleware;
