import express from 'express';
import { createTest } from '../controllers/testController.js';
import { body } from 'express-validator';

const router = express.Router();

router.post(
  '/',
  [
    body('wpm').isNumeric().withMessage('WPM (Words Per Minute) is required'),
    body('accuracy').isNumeric().withMessage('Accuracy is required'),
    body('text').isString().withMessage('Text is required'),
    body('duration').isNumeric().withMessage('Duration is required'),
    body('totalChars').isNumeric().withMessage('Total Character count is required'),
    body('intervalData').isArray().withMessage('Interval Data is required'),
  ],
  createTest
);

export default router;
