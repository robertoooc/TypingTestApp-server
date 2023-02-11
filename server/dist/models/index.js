// const mongoose = require('mongoose')
import mongoose from "mongoose";
// const dotenv = require('dotenv')
import dotenv from 'dotenv';
dotenv.config();
export function dbConnect() {
    const dbName = 'typingTestApp';
    const uri = 'mongodb://127.0.0.1/' + dbName;
    // .connect(uri)
    // .then(()=>{
    //     console.log('db connected')
    // })
    // .catch((error)=>{   
    //     console.log(error)
    //     process.exit(1)
    // })
    mongoose.connect(uri);
    const db = mongoose.connection;
    db.once('open', () => console.log(`mongodb has connected at ${db.host}:${db.port}`));
    db.on('error', () => console.error());
    return db;
}
// module.exports = {dbConnect}
// module.exports = dbConnect;
//  export default dbConnect()
// module.exports = {
//     User: User
// }
