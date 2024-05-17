import rateLimit from 'express-rate-limit';

const resetPasswordRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per windowMs
  message: 'Too many password reset attempts. Please try again later.',
});

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs,
  message: 'Too many requests. Please try again later.',
});

export { resetPasswordRateLimit, standardLimiter };
