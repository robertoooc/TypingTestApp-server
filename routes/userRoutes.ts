import express from 'express';
import {
  getUserById,
  updateUserById,
  deleteUserById,
} from '../controllers/users.js';
const router = express.Router();

router.get('/', getUserById);
router.put('/', updateUserById);
router.delete('/', deleteUserById);

export default router;
