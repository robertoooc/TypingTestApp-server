// import db = require('./models/index')
import User from './models/User'

async function test(){
    try{
        // let user={
        //     name: 'test',
        //     email: 'test@test',
        //     password: 'test'
        // }
        const newUser = await User.create({
            name: 'test',
            email: 'test@test',
            password: 'test'
        })
        console.table(newUser)
    }catch(err){
        console.log(err)
    }
}
test()