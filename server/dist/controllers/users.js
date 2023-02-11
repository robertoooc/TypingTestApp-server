import express from 'express';
import User from '../models/User.js';
import { dbConnect } from '../models/index.js';
import { genSaltSync, hashSync, compareSync } from 'bcrypt-ts';
import jwt from 'jsonwebtoken';
dbConnect();
const router = express.Router();
router.get('/', async (req, res) => {
    try {
        const findUser = await User.findById(req.body.id);
        if (findUser) {
            return res.status(200).json(findUser);
        }
        else {
            return res.status(404).json({ message: " User not found " });
        }
    }
    catch (err) {
        res.status(500).json({ message: 'My bad' });
    }
});
// router.post('/', async(req:Request,res:Response)=>{
//     try{
//         const newUser = new User(req.body)
//         const saveUser = await newUser.save()
//         res.json({saveUser})
//     }catch(err){
//         res.status(500).json({message: 'My bad'})
//     }
// })
router.delete('/', async (req, res) => {
    try {
        const deleteUser = await User.findOneAndDelete({ _id: req.body.id });
        if (!deleteUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ message: 'user deleted', deleteUser });
    }
    catch (err) {
        res.status(500).json({ message: 'My bad' });
    }
});
router.post('/register', async (req, res) => {
    try {
        // checking if new user already exists in db
        const findUser = await User.findOne({
            email: req.body.email
        });
        if (findUser)
            return res.status(400).json({ message: 'User already exists' });
        const password = req.body.password;
        const saltRounds = 12;
        const salt = genSaltSync(saltRounds);
        const hashedPassword = hashSync(password, salt);
        console.log(hashedPassword);
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        const jwtPayload = {
            name: newUser.name,
            email: newUser.email,
            id: newUser.id,
        };
        const secret = process.env.JWT_SECRET;
        const token = await jwt.sign(jwtPayload, secret);
        res.json({ token });
    }
    catch (err) {
        res.status(500).json({ message: 'My Bad' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const foundUser = await User.findOne({ email: req.body.email });
        if (!foundUser)
            return res.status(404).json({ message: 'Login failed' });
        const passwordLogin = await compareSync(req.body.password, foundUser.password);
        if (!passwordLogin)
            return res.status(400).json({ message: 'Login failed' });
        const jwtPayload = {
            name: foundUser.name,
            email: foundUser.email,
            id: foundUser.id,
        };
        const secret = process.env.JWT_SECRET;
        const token = await jwt.sign(jwtPayload, secret);
        res.json({ token });
    }
    catch (err) {
        res.status(500).json({ message: "My Bad" });
    }
});
export default router;
