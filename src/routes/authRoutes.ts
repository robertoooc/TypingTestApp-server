import express from 'express';
import { googleAuth, login, register, logout, createGuest } from '../controllers/authController.js';
import { body } from 'express-validator';
import { authRateLimit } from '../utils/rateLimiters.js';
const router = express.Router();

router.post('/google', googleAuth);
router.post(
  '/register',
  [
    body('password')
      .trim()
      .isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
      })
      .withMessage('Password must be at least 6 characters long, contain at least 1 lowercase letter, 1 uppercase letter, and 1 number'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('name').trim().notEmpty().withMessage('Please enter your name'),
  ],
  authRateLimit,
  register
);
router.post(
  '/login',
  [body('email').isEmail().withMessage('Please enter a valid email'), body('password').trim().notEmpty().withMessage('Please enter your password')],
  authRateLimit,
  login
);
router.post('/guest', createGuest);
router.get('/logout', logout);

export default router;
