import express from 'express';
import { forgotPassword, resetPassword } from '../controllers/passwordController.js';
import { body } from 'express-validator';
import { resetPasswordRateLimit } from '../utils/rateLimiters.js';

const router = express.Router();

router.post('/forgotpassword', [body('email').isEmail()], resetPasswordRateLimit, forgotPassword);
router.post(
  '/reset',
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
    body('token').trim().notEmpty().isUUID().withMessage('Invalid token'),
  ],
  resetPasswordRateLimit,
  resetPassword
);

export default router;
