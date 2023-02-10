"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbName = 'typingTestApp';
const uri = 'mongod://127.0.0.1/' + dbName;
mongoose_1.default.connect(uri);
const db = mongoose_1.default.connection;
db.once('open', () => console.log(`mongodb has connected at ${db.host}:${db.port}`));
db.on('error', () => console.error());
module.exports = {
    User: require('./User')
};
