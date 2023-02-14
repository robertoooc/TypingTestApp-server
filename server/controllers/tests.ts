import express, {Express, Request, Response} from 'express'
import User from '../models/User.js'
import { dbConnect } from '../models/index.js'
import { middleware } from './middleware.js'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { StringExpressionOperatorReturningBoolean } from 'mongoose'
dbConnect()
const router = express.Router()
declare var process : {
    env : {
        JWT_SECRET: string
    }
} 
router.post('/', async(req:Request, res: Response)=>{
    try{
        const authHeader = req.headers.authorization
        if (!authHeader) throw new Error('JWT token is missing')
        interface JWTPayload{
            name: string;
            email: string;
            id:string;
            iat: number
        }
        const decode = await <JWTPayload>jwt.verify(authHeader,process.env.JWT_SECRET)
        const foundUser = await User.findOne({_id:decode.id})
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