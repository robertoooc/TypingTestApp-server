import express, {Express, Request, Response} from 'express'
import User from '../models/User.js'
import { dbConnect } from '../models/index.js'
dbConnect()
const router = express.Router()

router.get('/', async(req: Request,res: Response)=>{
    try{
        const findUser = await User.findById(req.body.id)
        if (findUser){
            res.status(200).json(findUser)
        }
        else{
            res.status(404).json({message:" User not found "})
        }
    }catch(err){
        res.status(500).json({message: 'My bad'})
    }
})

router.post('/', async(req:Request,res:Response)=>{
    try{

    }catch(err){
        res.status(500).json({message: 'My bad'})
    }
})

export default router