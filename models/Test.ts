import mongoose, { Schema, Document } from 'mongoose';

interface IMistake extends Document {
  char: string;
  amount: number;
}

interface ITest extends Document {
  wpm: number;
  mistakes: IMistake[];
  accuracy: number;
}

const MistakeSchema: Schema = new Schema({
  char: { type: String, lowercase: true },
  amount: { type: Number },
});

const TestSchema: Schema = new Schema({
  wpm: { type: Number },
  mistakes: [MistakeSchema],
  time: { type: Date, default: Date.now },
  accuracy: { type: Number },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
});

export default mongoose.model<ITest>('Test', TestSchema);
