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
router.get('/:id',middleware,async(req:Request,res:Response)=>{
    try{
        const foundUser = await User.findById(res.locals.user._id)
        if(!foundUser) throw new Error('user not found')
        // console.log(foundUser)
        // interface mistakes{
        //     char: string,
        //     amount: number,
        // }
        // interface tests{
        //     wpm: number, 
        //     mistakes: [mistakes],
        //     _id: string
        // }
        const testId:string = req.params.id
        // console.log(testId)
        // console.log(foundUser.tests)
        const container = []
        // interface tests{
        //     wpm:string,
        //     _id: string
        // }

        // const typeUser:Array<tests> = foundUser.tests
        // foundUser.tests.forEach((test:any)=>console.log(test?.wpm,'🔥'))
        let index
        const findTest = foundUser.tests.filter((test:any, idx:number)=>{
            // console.log(idx)
            if(test._id==req.params.id) {
                index =idx
                return idx
            }
        })
        if(index!=0 && index!= undefined){
            // console.log(foundUser.tests[index-1],'🔥',foundUser.tests[index])
            const currentTest:any =foundUser.tests[index]
            const oldTest:any = foundUser.tests[index-1]

            // if(oldTest?.wpm > currentTest.wpm){
            //     console.log('decrease')
                
            // }else if (oldTest?.wpm == currentTest.wpm){
            //     console.log('neutral')
            // }else{
            //     console.log('increase')
            // }
            let percentage
            if(oldTest?.wpm != currentTest.wpm){
                percentage =((currentTest.wpm-oldTest.wpm )/Math.abs(oldTest.wpm))*100
            }else{
                percentage = 0
            }
            console.log(percentage)
        }
        // console.log(typeof(findTest))
        // console.log(index)

    }catch(err){
        res.status(500).json({message:'My bad'})
    }
})


router.post('/',middleware,async(req:Request, res: Response)=>{
    try{
        const foundUser = await User.findById(res.locals.user._id)
        if(!foundUser) throw new Error('user not found')
        const wpm:number = req.body.wpm
        const mistakes = req.body.mistakes
        const payload={
            wpm,
            mistakes
        }
        // adding new test to assigned user
        foundUser.tests.push(payload)
        await foundUser.save()
        if (res.locals.user.wpm < wpm){
            // if new test has an improved wpm update the user's wpm field 
           const updateWPM= await User.findByIdAndUpdate(res.locals.user.id,{wpm: wpm})
            res.json({updateWPM})
        }else{
            res.json({foundUser})
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
    }catch(err:any){
        res.status(500).json({message:'My bad'})
    }
})






export default router