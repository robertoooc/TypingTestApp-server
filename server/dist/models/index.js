"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
function dbConnect() {
    const dbName = 'typingTestApp';
    const uri = 'mongodb://127.0.0.1/' + dbName;
    return mongoose
        .connect(uri)
        .then(() => {
        console.log('db connected');
    })
        .catch((err) => {
        console.log(err);
        process.exit(1);
    });
    // mongoose.connect(uri)
    // const db = mongoose.connection
    // db.once('open',()=>console.log(`mongodb has connected at ${db.host}:${db.port}`))
    // db.on('error', ()=>console.error())
}
exports.default = dbConnect;
// module.exports = dbConnect;
// export default dbConnect()
// module.exports = {
//     User: User
// }
