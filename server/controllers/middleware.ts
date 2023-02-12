import { Request,Response,NextFunction } from "express"
import User from "../models/User.js"
import jwt from "jsonwebtoken"
import { dbConnect } from "../models/index.js"
dbConnect()
declare var process : {
    env : {
        JWT_SECRET: string
    }
} 

export const middleware = async(req:Request, res: Response, next:NextFunction)=>{
    try{
        const authHeader = req.headers.authorization
        if (!authHeader) throw new Error('JWT token is missing')
        console.log(authHeader, "🍓🍓🍓🍓")
        const decode = await jwt.verify(authHeader,process.env.JWT_SECRET)
        const foundUser = await User.findById(decode)
        res.locals.user = foundUser
        console.log(foundUser)
        next()
    }catch(err){
        console.log(err)
        res.locals.user = null
        next()
    }
}