import express from 'express';
import { getUser, getUserById, updateUserById, deleteUserById, uploadProfilePic, deleteProfilePic, requestEmailUpdate, updateEmail } from '../controllers/userController.js';
import { upload } from '../utils/multerConfig.js';
import { body } from 'express-validator';

const router = express.Router();

router.get('/', getUser);
router.get('/:id', getUserById);
router.put('/', updateUserById);
router.delete('/', deleteUserById);

router.get('/emailUpdate', requestEmailUpdate);

router.put(
  '/emailUpdate',
  [body('token').trim().notEmpty().isUUID().withMessage('Invalid token'), body('newEmail').isEmail().withMessage('Please enter a valid email')],
  updateEmail
);

router.post('/profilePic', upload, uploadProfilePic);
router.delete('/profilePic', upload, deleteProfilePic);

export default router;
