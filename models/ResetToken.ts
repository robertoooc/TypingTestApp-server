import mongoose, { Schema, Document, Types } from 'mongoose';


interface IResetToken extends Document {
  token: string;
  email: string;
  expiration: Date;
}

const ResetTokenSchema: Schema = new Schema({
  token: { type: String, required: true },
  email: { type: String, required: true },
  expiration: { type: Date, required: true },
});

export default mongoose.model<IResetToken>('ResetToken', ResetTokenSchema);
