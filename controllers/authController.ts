import axios from 'axios';
import jwt from 'jsonwebtoken';
import oauth2Client from '../utils/oauth2client.js';
import User from '../models/User.js';
import { Request, Response } from 'express';
import { genSaltSync, hashSync, compareSync } from 'bcrypt-ts';
import catchAsync from '../utils/catchAsync.js';

declare var process: {
  env: {
    JWT_SECRET: string;
    JWT_TIMEOUT: string;
    JWT_COOKIE_EXPIRES_IN: number;
    NODE_ENV: string;
  };
};

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TIMEOUT,
  });
};

const createSendToken = (user: any, statusCode: any, res: any) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(Date.now() + +process.env.JWT_COOKIE_EXPIRES_IN),
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
  try {
    const googleRes = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(googleRes.tokens);

    const userRes: any = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );
    const { name, email } = userRes.data;

    let user = await User.findOne({ email: userRes.data.email });

    if (!user) {
      user = await User.create({
        name,
        email,
        wpm: 0,
        googleOAuth: true,
      });
    }
    createSendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
});

const login = async (req: any, res: any) => {
  try {
    const foundUser = await User.findOne({ email: req.body.email });
    if (!foundUser) return res.status(404).json({ message: 'Login failed' });
    const passwordLogin = await compareSync(
      req.body.password,
      foundUser.password
    );
    if (!passwordLogin)
      return res.status(400).json({ message: 'Login failed' });

    createSendToken(foundUser, 200, res);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

const register = async (req: Request, res: Response) => {
  try {
    // checking if new user already exists in db
    const findUser = await User.findOne({
      email: req.body.email,
    });

    if (findUser)
      return res.status(400).json({ message: 'User already exists' });

    const password: string = req.body.password;
    const saltRounds: number = 12;
    const salt = genSaltSync(saltRounds);
    const hashedPassword = hashSync(password, salt);

    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      wpm: 0,
    });

    createSendToken(newUser, 201, res);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export { googleAuth, login, register };
