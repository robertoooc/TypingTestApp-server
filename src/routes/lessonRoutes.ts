import express from 'express';
import { createLesson, getLessonById, getRandomLesson, createLessonBatch, createLessonFromShuffledWords } from '../controllers/lessonController.js';
const router = express.Router();

router.post('/', createLesson);
router.post('/batch', createLessonBatch);
router.post('/shuffled', createLessonFromShuffledWords);
router.get('/:lessonId', getLessonById);
router.get('/random/:char', getRandomLesson);

export default router;
