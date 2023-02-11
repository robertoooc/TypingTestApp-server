import express from 'express'
import User from '../models/User.js'
import { dbConnect } from '../models/index.js'
dbConnect()
const router = express.Router()

router.get('/:id', async(req,res)=>{
    try{
        const findUser = await User.findById(req.params.id)
        console.log(findUser)
        res.send(findUser)
    }catch(err){
        res.send(err)
    }
})

export default router