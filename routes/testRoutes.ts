import express from 'express';
import { createTest, getAllTests } from '../controllers/tests.js';

const router = express.Router();

router.get('/all', getAllTests);
// router.get('/:id', getTestById);
router.post('/', createTest);

export default router;
