import express from 'express';
import User from '../models/User.js';
import { dbConnect } from '../models/index.js';
import { middleware } from './middleware.js';
dbConnect();
const router = express.Router();
router.get('/:id', middleware, async (req, res) => {
    try {
        const foundUser = await User.findById(res.locals.user._id);
        if (!foundUser)
            throw new Error('user not found');
        const testId = req.params.id;
        let index;
        const findTest = foundUser.tests.filter((test, idx) => {
            if (test._id == req.params.id) {
                index = idx;
                return idx;
            }
        });
        let percentage, data;
        if (index != 0 && index != undefined) {
            const currentTest = foundUser.tests[index];
            const oldTest = foundUser.tests[index - 1];
            if (oldTest?.wpm != currentTest.wpm) {
                oldTest.wpm == 0 ? percentage = (((currentTest.wpm - 0) / Math.abs(1)) * 100).toFixed(2) : percentage = (((currentTest.wpm - oldTest.wpm) / Math.abs(oldTest.wpm)) * 100).toFixed(2);
                data = {
                    currentTest: currentTest,
                    oldTest: oldTest,
                    percentage: percentage
                };
            }
            else {
                percentage = 0;
                data = {
                    currentTest: currentTest,
                    oldTest: oldTest,
                    percentage: percentage
                };
            }
        }
        else if (index != undefined && index == 0) {
            const currentTest = foundUser.tests[index];
            percentage = (((currentTest.wpm - 0) / Math.abs(1)) * 100).toFixed(2);
            data = {
                currentTest: currentTest,
                oldTest: 'no previous test',
                percentage: percentage
            };
        }
        console.log(percentage);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ message: 'My bad' });
    }
});
router.post('/', middleware, async (req, res) => {
    try {
        const foundUser = await User.findById(res.locals.user._id);
        if (!foundUser)
            throw new Error('user not found');
        const wpm = req.body.wpm;
        const mistakes = req.body.mistakes;
        const accuracy = req.body.accuracy;
        const payload = {
            wpm,
            mistakes,
            accuracy
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
