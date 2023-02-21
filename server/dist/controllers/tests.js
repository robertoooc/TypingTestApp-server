import express from 'express';
import User from '../models/User.js';
import { dbConnect } from '../models/index.js';
import jwt from 'jsonwebtoken';
dbConnect();
const router = express.Router();
router.post('/', async (req, res) => {
    try {
        // checking that user making requests is logged in through jwts
        const authHeader = req.headers.authorization;
        if (!authHeader)
            throw new Error('JWT token is missing');
        const decode = await jwt.verify(authHeader, process.env.JWT_SECRET);
        const foundUser = await User.findById(decode.id);
        if (!foundUser)
            throw new Error('User not found');
        res.locals.user = foundUser;
        const wpm = req.body.wpm;
        const mistakes = req.body.mistakes;
        const payload = {
            wpm,
            mistakes
        };
        // adding new test to assigned user
        foundUser.tests.push(payload);
        await foundUser.save();
        if (res.locals.user.wpm < wpm) {
            // if new test has an improved wpm update the user's wpm field 
            const updateWPM = await User.findByIdAndUpdate(res.locals.user.id, { wpm: wpm });
            res.json({ updateWPM });
        }
        else {
            res.json({ foundUser });
        }
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
        res.status(500).json({ message: 'My bad' });
    }
});
export default router;
