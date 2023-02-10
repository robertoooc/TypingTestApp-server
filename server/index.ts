import express, {Express, Request, Response} from 'express'
import dotenv from 'dotenv'
import dbConnect from './models/index'
dotenv.config()

const PORT = process.env.PORT || 8000 
const app: Express = express()

app.get('/', (req: Request, res: Response)=>{
    res.send('home')
})

app.listen(PORT, ()=>{
    console.log(PORT)
    dbConnect()
})