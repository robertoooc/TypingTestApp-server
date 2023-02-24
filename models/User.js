"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var Mistakes = new mongoose_1.Schema({
    char: { type: String, lowercase: true },
    amount: { type: Number }
});
var Tests = new mongoose_1.Schema({
    wpm: { type: Number, "default": 0 },
    mistakes: [Mistakes]
});
var UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    average: { type: Number, "default": 0 },
    best: { type: Number, "default": 0 },
    tests: [Tests]
});
// module.exports = mongoose.model('User', User)
exports["default"] = mongoose_1["default"].model('User', UserSchema);
// module.exports = mongoose.model('User', UserSchema)
