import express from 'express';
import { getTestById, createTest } from '../controllers/tests.js';
const router = express.Router();

router.get('/:id', getTestById);
router.post('/', createTest);

export default router;
