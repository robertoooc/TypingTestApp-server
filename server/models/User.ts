import mongoose, {Schema} from 'mongoose'
// import Double from 'mongoose'
// require('@mongoosejs/double')

const Mistakes: Schema= new Schema({
    char: { type: String, lowercase: true },
    amount: {type: Number}
})

const Tests: Schema= new Schema({
    wpm: { type: Number, default: 0 },
    mistakes: [Mistakes]
})

const User: Schema = new Schema({
    name:{ type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    average: { type: Number, default: 0 }, // will come back and try to convert to Float
    best: { type: Number, default: 0 },
    tests: [Tests]
})
module.exports = mongoose.model('User', User)