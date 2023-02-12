import express from 'express';
import User from '../models/User.js';
import { dbConnect } from '../models/index.js';
import { middleware } from './middleware.js';
dbConnect();
const router = express.Router();
router.post('/', middleware, async (req, res) => {
    try {
        if (!res.locals.user)
            throw new Error('User not logged in');
        const findUser = await User.findById(req.body.id);
        if (!findUser)
            return res.status(404).json({ message: 'User not found' });
        const wpm = req.body.wpm;
        const mistakes = req.body.mistakes;
        const payload = {
            wpm,
            mistakes
        };
        findUser.tests.push(payload);
        await findUser.save();
        res.json({ findUser });
        // {
        //     "id": "63e8229205216e93bca9ab65",
        //      "wpm": 30,
        //      "mistakes":[
        //        {
        //          "char": "t",
        //          "amount": 5
        //        },
        //        {
        //          "char":"e",
        //          "amount": 7
        //        }
        //        ]
        //    }
    }
    catch (err) {
        console.log(err);
    }
});
export default router;
