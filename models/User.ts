import mongoose, { Schema, Document, Types } from 'mongoose';
import { ITest } from './Test.js';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  wpm: number;
  tests: Types.ObjectId[] | ITest[];
  googleOAuth: boolean;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleOAuth: { type: Boolean, default: false },
  password: {
    type: String,
    required: function (this: IUser) {
      return !this.googleOAuth;
    },
  },
  wpm: { type: Number, required: true, default: 0 },
  tests: [{ type: Schema.Types.ObjectId, ref: 'Test' }],
});

export default mongoose.model<IUser>('User', UserSchema);
