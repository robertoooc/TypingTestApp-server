import mongoose, { Schema } from 'mongoose';
const Mistakes = new Schema({
    char: { type: String, lowercase: true },
    amount: { type: Number }
});
const Tests = new Schema({
    wpm: { type: Number, default: 0 },
    mistakes: [Mistakes]
});
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    average: { type: Number, default: 0 },
    best: { type: Number, default: 0 },
    tests: [Tests]
});
// module.exports = mongoose.model('User', User)
export default mongoose.model('User', UserSchema);
///module.exports = mongoose.model('User', UserSchema)
