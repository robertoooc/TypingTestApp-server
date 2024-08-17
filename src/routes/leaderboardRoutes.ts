import express from 'express';
import { getLeaderboard, getUserList } from '../controllers/leaderboardController.js';
const router = express.Router();

router.get('/tests', getLeaderboard);
router.get('/users', getUserList);

export default router;
