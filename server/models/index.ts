import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const dbName: string = 'typingTestApp'
const uri: string = 'mongod://127.0.0.1/' + dbName
 
mongoose.connect(uri)
const db: any = mongoose.connection

db.once('open',()=>console.log(`mongodb has connected at ${db.host}:${db.port}`))

db.on('error', ()=>console.error())

module.exports = {
    User: require('./User')
}