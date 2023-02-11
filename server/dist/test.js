// import db = require('./models/index')
// const dbConnect = require('./models/index.ts') 
// dbConnect()
// const User = require('./models/User')
// import User from './models/User'
// const User = require('./models/User')
import { dbConnect } from './models/index.js'
dbConnect()
import User from './models/User.js';
async function test() {
    try {
        // let user={
        //     name: 'test',
        //     email: 'test@test',
        //     password: 'test'
        // }
        const newUser = await User.create({
            name: 'test',
            email: 'teddst@test',
            password: 'test'
        });
        console.log(newUser);
    }
    catch (err) {
        console.log(err);
    }
}
test();
