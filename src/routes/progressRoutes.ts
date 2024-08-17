import express from 'express';
import { getProgressById, updateProgressById } from '../controllers/progresController.js';

const router = express.Router();

router.get('/', getProgressById);
router.put('/', updateProgressById);

export default router;
