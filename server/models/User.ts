import moongoose, { Document, Schema} from 'mongoose'

const User: Schema = new Schema({
    name:{ type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    average: { type: String}
})