// const User = require('./models/User')
import { dbConnect } from './models/index.js';
// 
async function test() {
    try {
        // let user={
        //     name: 'test',
        //     email: 'test@test',
        //     password: 'test'
        // }
        dbConnect();
        // const newUser = await User.create({
        //     name: 'test',
        //     email: 'test@test',
        //     password: 'test'
        // })
        //console.table(newUser)
    }
    catch (err) {
        console.log(err);
    }
}
test();
