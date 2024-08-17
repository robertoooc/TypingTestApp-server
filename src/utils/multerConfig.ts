import multer from 'multer';
import { Request } from 'express';

// Initialize multer storage and file filter
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter
}).single('profilePic');
