import User from '../models/User.js';
import Test from '../models/Test.js';
import { validationResult } from 'express-validator';
const getAllTests = async (req, res) => {
    try {
        const allTests = await Test.find({}).populate('user');
        res.status(200).json(allTests);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
// const getTestById = async (req: Request, res: Response) => {
//   try {
//     const foundUser = await User.findById(res.locals.user._id).populate(
//       'tests'
//     );
//     if (!foundUser) throw new Error('User not found');
//     const testId = new mongoose.Types.ObjectId(req.params.id);
//     const index = foundUser.tests.findIndex((test) => test._id.equals(testId));
//     if (index === -1) {
//       throw new Error('Test not found');
//     }
//     const currentTest = foundUser.tests[index];
//     const oldTest = index > 0 ? foundUser.tests[index - 1] : null;
//     let percentage = 0;
//     if (oldTest) {
//       percentage = (
//         ((currentTest.wpm - oldTest.wpm) / Math.abs(oldTest.wpm)) *
//         100
//       ).toFixed(2);
//     }
//     const data = {
//       currentTest,
//       oldTest: oldTest || 'No previous test',
//       // percentage,
//     };
//     res.status(200).json(data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
const createTest = async (req, res) => {
    try {
        const { wpm, mistakes, accuracy } = req.body;
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Find user
        const foundUser = await User.findById(res.locals?.user?._id);
        // Create new test
        const newTest = new Test({
            wpm,
            mistakes,
            accuracy,
            user: foundUser,
        });
        // Save the new test
        await newTest.save();
        // Associate test with user
        if (foundUser) {
            foundUser.tests.push(newTest._id);
            await foundUser.save();
        }
        // Update user's WPM if new test has improved WPM
        if (foundUser && res.locals.user.wpm < wpm) {
            await User.findByIdAndUpdate(res.locals.user.id, { wpm });
        }
        res.status(201).json({ newTest });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export { getAllTests, createTest };
