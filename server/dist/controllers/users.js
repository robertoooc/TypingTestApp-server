import express from 'express';
import User from '../models/User.js';
import { dbConnect } from '../models/index.js';
dbConnect();
const router = express.Router();
router.get('/', async (req, res) => {
    try {
        const findUser = await User.findById(req.body.id);
        res.json(findUser);
    }
    catch (err) {
        res.json(err);
    }
});
export default router;
