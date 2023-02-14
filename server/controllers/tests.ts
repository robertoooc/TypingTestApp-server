import express, {Express, Request, Response} from 'express'
import User from '../models/User.js'
import { dbConnect } from '../models/index.js'
import { middleware } from './middleware.js'
import jwt from 'jsonwebtoken'
dbConnect()
const router = express.Router()
declare var process : {
    env : {
        JWT_SECRET: string
    }
} 
router.post('/', async(req:Request, res: Response)=>{
    try{
        console.log(req.headers.authorization, '🛑🛑')
        const authHeader = req.headers.authorization
        if (!authHeader) throw new Error('JWT token is missing')
        const decode = await jwt.verify(authHeader,process.env.JWT_SECRET)
        let id = decode.id
        console.log(decode, '🐙')
        const foundUser = await User.findOne({_id:id})
        if(!foundUser) throw new Error('User not found')
        res.locals.user = foundUser
        const wpm = req.body.wpm
        const mistakes = req.body.mistakes
        const payload={
            wpm,
            mistakes
        }
        foundUser.tests.push(payload)
        await foundUser.save()
        console.log(foundUser)
        res.json({foundUser})
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
    }catch(err:any){
        console.log(err.message)
    }
})






export default router