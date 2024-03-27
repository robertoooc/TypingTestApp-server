import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    wpm: { type: Number, required: true, default: 0 },
    tests: [{ type: Schema.Types.ObjectId, ref: 'Test' }],
});
export default mongoose.model('User', UserSchema);
