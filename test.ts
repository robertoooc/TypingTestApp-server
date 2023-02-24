// import db = require('./models/index')
// const dbConnect = require('./models/index.ts') 
// dbConnect()
// const User = require('./models/User')
 import User from './models/User.js'
// const User = require('./models/User')
 import { dbConnect } from './models/index.js'
 // 
 
 async function test(){
     try{
         // let user={
             //     name: 'test',
             //     email: 'test@test',
             //     password: 'test'
             // }
             dbConnect()
        // const newUser = await User.create({
        //     name: 'test',
        //     email: 'test@test',
        //     password: 'test'
        // })
        //console.table(newUser)
    }catch(err){
        console.log(err)
    }
}
test()