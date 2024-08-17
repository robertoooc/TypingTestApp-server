import { Request, Response } from 'express';
import { genSaltSync, hashSync, compareSync } from 'bcrypt-ts';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import oauth2Client from '../utils/oauth2client.js';
import catchAsync from '../utils/catchAsync.js';
import prisma from '../prisma/index.js';
import { setCache } from '../utils/cache.js';

declare var process: {
  env: {
    JWT_SECRET: string;
    JWT_TIMEOUT: string;
    JWT_COOKIE_EXPIRES_IN: number;
    NODE_ENV: string;
  };
};

const signToken = (id: string, expiresIn: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

const createSendToken = (user: any, statusCode: any, res: any) => {
  delete user.password;
  const tokenExpiration = (user.guest ? '2d' : process.env.JWT_COOKIE_EXPIRES_IN) as string;
  const token = signToken(user.id, tokenExpiration);

  const cookieOptions = {
    expires: new Date(Date.now() + (user.guest ? 2 * 24 * 60 * 60 * 1000 : +process.env.JWT_COOKIE_EXPIRES_IN)),
    httpOnly: true,
    path: '/',
    secure: false,
    sameSite: 'none',
  };

  if (process.env.NODE_ENV === 'production') {
    // secure is only sent to server with encrypted reqest HTTPS/ not sent to unsecure HTTP besides localhost
    // prevents man-in the middle attacks
    cookieOptions.secure = true;
    cookieOptions.sameSite = 'none';
  }

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    message: 'success',
    token,
    user,
  });
};

//===   LOGIN THROUGH GOOGLE OAUTH  ==\\
const googleAuth = catchAsync(async (req: any, res: any, next: any) => {
  const code = req.query.code;

  if (!code) return res.status(400).json({ message: 'Invalid code' });

  try {
    const googleRes = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(googleRes.tokens);

    const userRes: any = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);
    const { name, email } = userRes.data;

    let user = await prisma.user.findUnique({
      where: {
        email: userRes.data.email,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          wpm: 0,
          googleOAuth: true,
          guest: false,
        },
        include: {
          tests: true,
          progress: true,
        },
      });
    }

    await setCache(`user_${user.id}`, user);

    createSendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
});

const login = async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const concatenatedErrors = errors.array().map((error) => error.msg);
      return res.status(400).json({ message: concatenatedErrors });
    }

    const foundUser = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
      include: {
        tests: true,
        progress: true,
      },
    });

    if (!foundUser) return res.status(404).json({ message: 'User not found' });

    if (foundUser.googleOAuth) return res.status(400).json({ message: 'Sign in through Google' });

    if (!foundUser.password || !req.body.password || foundUser.guest) return res.status(400).json({ message: 'Login failed' });

    const passwordLogin = await compareSync(req.body.password, foundUser.password);

    if (!passwordLogin) return res.status(400).json({ message: 'Login failed' });

    await setCache(`user_${foundUser.id}`, foundUser);

    createSendToken(foundUser, 200, res);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const concatenatedErrors = errors.array().map((error) => error.msg);
      return res.status(400).json({ message: concatenatedErrors });
    }
    // checking if new user already exists in db
    const findUser = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (findUser) return res.status(400).json({ message: 'User already exists' });

    const password: string = req.body.password;
    const saltRounds: number = 12;
    const salt = genSaltSync(saltRounds);
    const hashedPassword = hashSync(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        wpm: 0,
        googleOAuth: false,
        guest: false,
      },
      include: {
        tests: true,
        progress: true,
      },
    });

    await setCache(`user_${newUser.id}`, newUser);

    createSendToken(newUser, 201, res);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

const createGuest = async (req: Request, res: Response) => {
  try {
    const newUuid = uuidv4();
    const newUser = await prisma.user.create({
      data: {
        name: `Guest-${newUuid}`,
        wpm: 0,
        googleOAuth: false,
        guest: true,
      },
      include: {
        tests: true,
        progress: true,
      },
    });

    await setCache(`user_${newUser.id}`, newUser);

    createSendToken(newUser, 201, res);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

const logout = (req: Request, res: Response) => {
  const cookieOptions = {
    expires: new Date(Date.now()),
    httpOnly: true,
    path: '/',
    secure: false,
    sameSite: false,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
    cookieOptions.sameSite = false;
  }

  res.clearCookie('jwt', cookieOptions);

  res.status(200).json({ message: 'Logged out successfully' });
};

export { googleAuth, login, register, createGuest, logout };
