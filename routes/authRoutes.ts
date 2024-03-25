import express from 'express';
import { googleAuth, login, register } from '../controllers/authController.js';
const router = express.Router();

router.post('/google', googleAuth);
router.post('/register', register);
router.post('/login', login);

export default router;
