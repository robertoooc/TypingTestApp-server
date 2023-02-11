import express, {Express, Request, Response} from 'express'
// const dotenv = require('dotenv')
import dotenv from 'dotenv'
// import dotenv from 'dotenv'
// import  dbConnect  from 'models/index'
// import dbConnect = require('/models/index')
import {dbConnect} from './models/index.js'
import user from './controllers/users.js'
dotenv.config()

const PORT = process.env.PORT || 8000 
const app: Express = express()

app.get('/', (req: Request, res: Response)=>{
    res.send('home')
})

app.use('/users',user)

app.listen(PORT, ()=>{
    console.log(PORT)
     dbConnect()
})