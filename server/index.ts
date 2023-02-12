import express, {Express, Request, Response} from 'express'
import dotenv from 'dotenv'
import {dbConnect} from './models/index.js'
import user from './controllers/users.js'
import test from './controllers/tests.js'
dotenv.config()

const PORT = process.env.PORT || 8000 
const app: Express = express()
app.use(express.json())
app.get('/', (req: Request, res: Response)=>{
    res.send('home')
})

app.use('/users',user)
app.use('/tests',test)
app.listen(PORT, ()=>{
    console.log(PORT)
     dbConnect()
})