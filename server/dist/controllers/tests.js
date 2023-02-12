import express from 'express';
import User from '../models/User.js';
import { dbConnect } from '../models/index.js';
dbConnect();
const router = express.Router();
router.post('/', async (req, res) => {
    try {
        console.log(req.body);
        const findUser = await User.findById(req.body.id);
        if (!findUser)
            return res.status(404).json({ message: 'User not found' });
        const wpm = req.body.wpm;
        const mistakes = req.body.mistakes;
        const payload = {
            wpm,
            mistakes
        };
        console.log(payload, 'hererere🛑🛑');
        findUser.tests.push(payload);
        console.log(findUser);
        await findUser.save();
        console.log(findUser);
        res.json({ findUser });
        // {
        //  "id": "userId",
        //  "payload": {
        //      test:{
        //          wpm: number,
        //          mistakes: [
        //              {
        //              char: 'character',
        //              amount: number
        //              },
        //              {
        //              char: 'character',
        //              amount: number
        //              }
        //          ]
        //      }
        //   }
        // }
    }
    catch (err) {
        console.log(err);
    }
});
export default router;
