import express from 'express';
// const dotenv = require('dotenv')
import dotenv from 'dotenv';
// import dotenv from 'dotenv'
// import  dbConnect  from 'models/index'
// import dbConnect = require('/models/index')
import { dbConnect } from './models/index.js';
dotenv.config();
const PORT = process.env.PORT || 8000;
const app = express();
app.get('/', (req, res) => {
    res.send('home');
});
app.listen(PORT, () => {
    console.log(PORT);
    dbConnect();
});
