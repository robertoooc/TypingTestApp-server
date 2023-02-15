import express, {Express, Request, Response} from 'express'
import User from '../models/User.js'
import { dbConnect } from '../models/index.js'
import { genSaltSync, hashSync, compareSync } from 'bcrypt-ts'
import { middleware } from './middleware.js'
import jwt from 'jsonwebtoken'
dbConnect()
const router = express.Router()
declare var process : {
    env : {
        JWT_SECRET: string
    }
}   

router.get('/',middleware,async(req: Request,res: Response)=>{
    try{
        const findUser = await User.findById(res.locals.user._id)
        console.log(findUser)
        if (findUser){
            return res.status(200).json(findUser)
        }
        else{
            return res.status(404).json({message:" User not found "})
        }
    }catch(err){
        res.status(500).json({message: 'My bad'})
    }
})

// router.post('/', async(req:Request,res:Response)=>{
//     try{
//         const newUser = new User(req.body)
//         const saveUser = await newUser.save()
//         res.json({saveUser})
//     }catch(err){
//         res.status(500).json({message: 'My bad'})
//     }
// })

router.delete('/',middleware, async (req:Request, res: Response)=>{
    try{
        const deleteUser = await User.findOneAndDelete({_id: res.locals.user._id})
        if(!deleteUser){
            return res.status(404).json({message:'User not found'})
        }
        return res.status(200).json({message: 'user deleted', deleteUser})
    }catch(err){
        res.status(500).json({message:'My bad'})
    }
})

router.put('/', middleware, async(req:Request, res:Response)=>{
    try{
        console.log(res.locals.user, 'success')
        const findUser = await User.findById(res.locals.user._id)
        if(!findUser) return res.status(404).json({message:"User not FOunnd"})
        const comparePassword = await compareSync(req.body.oldPassword, findUser.password)
        if(!comparePassword) return res.status(400).json({message:'Wrong password'})
        const newPassword:string = req.body.newPassword
        const saltRounds:number = 12
        const salt = genSaltSync(saltRounds)
        const hashedPassword = hashSync(newPassword, salt)
        const updatedUser = await User.findByIdAndUpdate(findUser.id,{password: hashedPassword})
        if(!updatedUser) return res.status(500).json({message:'My bad'})
        console.log(updatedUser, 'updated User 🧽')
        const jwtPayload: {name: string, email: string, id: string} = {
            name: updatedUser.name,
            email: updatedUser.email,
            id: updatedUser.id,
        }
        const secret = process.env.JWT_SECRET 
        const token = await jwt.sign(jwtPayload,secret)
        res.json({token})
    }catch(err){
        res.status(500).json({message:'My bad'})
    }
})

router.post('/register', async(req:Request,res:Response)=>{
    try{
        // checking if new user already exists in db
        const findUser = await User.findOne({
            email: req.body.email
        })
        if (findUser) return res.status(400).json({message: 'User already exists'})
    
        const password:string = req.body.password
        const saltRounds:number = 12
        const salt = genSaltSync(saltRounds)
        const hashedPassword = hashSync(password, salt)
        console.log(hashedPassword)

        const newUser = await User.create({
            name: req.body.name, 
            email: req.body.email,
            password: hashedPassword,
            wpm: 0
        })
        const jwtPayload: {name: string, email: string, id: string} = {
            name: newUser.name,
            email: newUser.email,
            id: newUser.id,
        }
        const secret = process.env.JWT_SECRET 
        const token = await jwt.sign(jwtPayload,secret)
        res.json({token})
    }catch(err){
        res.status(500).json({message: 'My Bad'})
    }
})

router.post('/login', async(req,res)=>{
    try{
        const foundUser = await User.findOne({ email: req.body.email })
        if(!foundUser) return res.status(404).json({message: 'Login failed'})
        const passwordLogin = await compareSync(req.body.password, foundUser.password)
        if(!passwordLogin) return res.status(400).json({message: 'Login failed'})

        const jwtPayload: {name: string, email: string, id: string} = {
            name: foundUser.name,
            email: foundUser.email,
            id: foundUser.id,
        }
        const secret = process.env.JWT_SECRET 
        const token = await jwt.sign(jwtPayload,secret)
        res.json({token})
    }catch(err){
        res.status(500).json({message: "My Bad"})
    }
})
export default router