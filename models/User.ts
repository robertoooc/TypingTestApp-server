import mongoose, { Schema, Document, Types } from 'mongoose';

// Define the Test interface directly within the User model file
interface ITest extends Document {
  wpm: number;
  mistakes: Array<{ char: string; amount: number }>;
  accuracy: number;
}

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  averageWPM: number;
  bestWPM: number;
  tests: Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  wpm: { type: Number, required: true, default: 0 },
  tests: [{ type: Schema.Types.ObjectId, ref: 'Test' }],
});

export default mongoose.model<IUser>('User', UserSchema);
