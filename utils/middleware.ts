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
    const publicRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/google',
      '/password/reset',
      '/password/forgotpassword',
      '/tests/all',
    ];
    if (publicRoutes.includes(req.path)) {
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
      console.log(err, 'error in middleware', req.originalUrl, req.path);
      res.locals.user = null;
      res.status(401).json({ message: 'Not authorized' });
    }
  });
};

export default middleware;
