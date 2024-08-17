import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import dispatchEmails from '../utils/dispatchEmails.js';
import moment from 'moment-timezone';
import { genSaltSync, hashSync } from 'bcrypt-ts';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import prisma from '../prisma/index.js';

const cryptoKey = process.env.CRYPTO_KEY as string;
const tokenExpirationTime = 60 * 60 * 1000; // 1 hour in milliseconds

const encrypt = (text: string) => {
  const iv = crypto.randomBytes(16); // Generate a random IV
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(cryptoKey), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + encrypted;
};

// Decryption function
const decrypt = (encryptedText: string) => {
  const iv = Buffer.from(encryptedText.slice(0, 32), 'hex'); // Extract IV from the encrypted text
  const encryptedData = encryptedText.slice(32); // Extract the encrypted data
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(cryptoKey), iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const checkToken = async (token: string) => {
  try {
    // const resetToken = await ResetToken.findOne({ token });
    const resetToken = await prisma.resetToken.findUnique({
      where: {
        token,
      },
    });

    if (!resetToken) return false;

    const now = new Date().getTime();
    const expirationTime = resetToken.expiration.getTime() + tokenExpirationTime;

    if (now > expirationTime) {
      // await resetToken.deleteOne();
      return false;
    }

    return resetToken;
  } catch (err: any) {
    return false;
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    const { email } = req.body;

    // const user = await User.findOne({ email });
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.googleOAuth) {
      return res.status(400).json({ message: 'Cannot reset this password' });
    }

    const encryptedEmail = encrypt(email);

    // check if there is already a token in the database corrolating to the email or more than one
    const existingToken = await prisma.resetToken.findUnique({
      where: { email: encryptedEmail },
    });

    if (existingToken) {
      await prisma.resetToken.delete({
        where: { email: encryptedEmail },
      });
    }

    const token = uuidv4();
    const url = `${process.env.CLIENT_URI}/password/reset/${token}`;

    const expiration = moment().tz('America/Los_Angeles').add(tokenExpirationTime, 'milliseconds').toDate();

    await prisma.resetToken.create({
      data: { token, expiration, email: encryptedEmail },
    });

    const subject = 'Password Reset';
    const message = `Click <a href=${url}>here</a> to reset your password.`;
    dispatchEmails({ recipient: email, subject, message });

    res.status(200).json({ message: 'Email sent' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const concatenatedErrors = errors.array().map((error) => error.msg);
      return res.status(400).json({ message: concatenatedErrors });
    }

    const { password, token } = req.body;
    const isValid = await checkToken(token);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    const decryptedEmail = decrypt(isValid.email);

    const user = await prisma.user.findUnique({
      where: {
        email: decryptedEmail,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const saltRounds = 12;
    const salt = genSaltSync(saltRounds);
    const hashedPassword = hashSync(password, salt);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    await prisma.resetToken.delete({
      where: {
        token,
      },
    });

    res.status(200).json({ message: 'Password reset' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export { forgotPassword, resetPassword, encrypt, decrypt, checkToken };
