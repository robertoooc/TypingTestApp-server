import { Request, Response, NextFunction, Express } from 'express';
import prisma from '../prisma/index.js';
import jwt from 'jsonwebtoken';

declare var process: {
  env: {
    JWT_SECRET: string;
  };
};

const middleware = (app: Express) => {
  app.all('*', async (req: Request, res: Response, next: NextFunction) => {
    const publicRoutes = ['/auth/', '/password/reset', '/password/forgotpassword'];

    // Check if the request path matches any public route
    const isPublicRoute = publicRoutes.some((route) => req.path.startsWith(route));

    if (isPublicRoute) {
      return next();
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
      const decode = jwt.verify(authHeader, process.env.JWT_SECRET) as JWTPayload;

      const foundUser = await prisma.user.findUnique({
        where: {
          id: decode.id,
        },
      });

      res.locals.user = foundUser;

      next();
    } catch (err) {
      res.locals.user = null;
      res.status(401).json({ message: 'Not authorized' });
    }
  });
};

export default middleware;
