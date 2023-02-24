import express, {Express, Request, Response,NextFunction} from 'express'
import dotenv from 'dotenv'
import {dbConnect} from './models/index.js'
import jwt from 'jsonwebtoken'
import user from './controllers/users.js'
import test from './controllers/tests.js'
import User from './models/User.js'
import cors from 'cors'
dotenv.config()
dbConnect()
declare var process : {
    env : {
        JWT_SECRET: string,
        PORT: number
    }
}  

const PORT = process.env.PORT || 8000 
const app: Express = express()
app.use(express.json())
app.use(cors())
app.get('/', (req: Request, res: Response)=>{
    res.send('home')
})

app.use('/users',user)
app.use('/tests',test)
app.listen(PORT, ()=>{
    console.log(PORT)
    // had issues with exporting just the model folder so exported a function to connect to db instead 
     dbConnect()
})