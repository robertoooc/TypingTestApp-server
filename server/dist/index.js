"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("./models/index"));
dotenv_1.default.config();
const PORT = process.env.PORT || 8000;
const app = (0, express_1.default)();
app.get('/', (req, res) => {
    res.send('home');
});
app.listen(PORT, () => {
    console.log(PORT);
    (0, index_1.default)();
});
